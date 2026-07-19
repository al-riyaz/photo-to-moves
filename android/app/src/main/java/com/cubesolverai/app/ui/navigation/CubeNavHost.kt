package com.cubesolverai.app.ui.navigation

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cubesolverai.app.ads.AdsInitializer
import com.cubesolverai.app.ads.InterstitialAdManager
import com.cubesolverai.app.ads.findActivity
import com.cubesolverai.app.ui.capture.CameraCaptureScreen
import com.cubesolverai.app.ui.capture.CaptureViewModel
import com.cubesolverai.app.ui.colorgrid.ColorReviewScreen
import com.cubesolverai.app.ui.home.HomeScreen
import com.cubesolverai.app.ui.solution.SolutionScreen
import java.net.URLDecoder
import java.net.URLEncoder

private object Routes {
    const val HOME = "home"
    const val CAPTURE = "capture"
    const val REVIEW = "review"
    const val SOLUTION = "solution/{facelets}"
    fun solution(facelets: String) = "solution/${URLEncoder.encode(facelets, "UTF-8")}"
}

private const val TRANSITION_MS = 220

@Composable
fun CubeNavHost(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    val captureViewModel: CaptureViewModel = viewModel()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        val activity = context.findActivity() ?: return@LaunchedEffect
        AdsInitializer.ensureInitialized(activity)
        InterstitialAdManager.preload(activity)
    }

    NavHost(
        navController = navController,
        startDestination = Routes.HOME,
        modifier = modifier,
        enterTransition = {
            slideInHorizontally(tween(TRANSITION_MS), initialOffsetX = { it / 6 }) + fadeIn(tween(TRANSITION_MS))
        },
        exitTransition = { fadeOut(tween(TRANSITION_MS)) },
        popEnterTransition = { fadeIn(tween(TRANSITION_MS)) },
        popExitTransition = {
            slideOutHorizontally(tween(TRANSITION_MS), targetOffsetX = { it / 6 }) + fadeOut(tween(TRANSITION_MS))
        },
    ) {
        composable(Routes.HOME) {
            HomeScreen(onScanCube = { navController.navigate(Routes.CAPTURE) })
        }
        composable(Routes.CAPTURE) {
            CameraCaptureScreen(
                viewModel = captureViewModel,
                onAllFacesCaptured = { navController.navigate(Routes.REVIEW) },
            )
        }
        composable(Routes.REVIEW) {
            ColorReviewScreen(
                viewModel = captureViewModel,
                onSolve = { facelets ->
                    val activity = context.findActivity()
                    if (activity != null) {
                        InterstitialAdManager.maybeShow(activity) {
                            navController.navigate(Routes.solution(facelets))
                        }
                    } else {
                        navController.navigate(Routes.solution(facelets))
                    }
                },
            )
        }
        composable(Routes.SOLUTION) { backStackEntry ->
            val encoded = backStackEntry.arguments?.getString("facelets").orEmpty()
            val facelets = URLDecoder.decode(encoded, "UTF-8")
            SolutionScreen(
                facelets = facelets,
                onDone = {
                    navController.popBackStack(Routes.HOME, inclusive = false)
                },
            )
        }
    }
}
