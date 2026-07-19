package com.cubesolverai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.cubesolverai.app.ui.navigation.CubeNavHost
import com.cubesolverai.app.ui.theme.CubeSolverTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CubeSolverTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    CubeNavHost()
                }
            }
        }
    }
}
