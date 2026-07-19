package com.cubesolverai.app.ui.solution

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.cubesolverai.solver.CubeModel

/**
 * Shows the cube at [currentIndex] moves into [moves], animating a single 90/180 degree layer
 * turn whenever the step index changes by one (forward or backward via Prev/Next).
 */
@Composable
fun AnimatedCubeView(
    facelets: String,
    moves: List<String>,
    currentIndex: Int,
    modifier: Modifier = Modifier,
) {
    var displayIndex by remember(facelets) { mutableIntStateOf(0) }
    var baseCube by remember(facelets) { mutableStateOf(CubeModel.fromFaceletString(facelets)) }
    var activeMove by remember(facelets) { mutableStateOf<String?>(null) }
    val progress = remember(facelets) { Animatable(1f) }

    LaunchedEffect(currentIndex, facelets) {
        while (displayIndex != currentIndex) {
            val stepForward = currentIndex > displayIndex
            val move = if (stepForward) moves[displayIndex] else invertMove(moves[displayIndex - 1])
            activeMove = move
            progress.snapTo(0f)
            progress.animateTo(1f, animationSpec = tween(durationMillis = 220))
            baseCube = baseCube.clone().apply { applyAlgorithm(move) }
            displayIndex += if (stepForward) 1 else -1
            activeMove = null
        }
    }

    val move = activeMove
    val movingLayer = move?.let { movingLayerForMove(it) }
    val rotation = move?.let { rotationForMove(it) }
    val stickers = remember(baseCube, movingLayer) { buildStickers(baseCube, movingLayer) }

    CubeCanvas(
        stickers = stickers,
        activeRotation = rotation,
        progress = progress.value,
        modifier = modifier.fillMaxWidth().aspectRatio(1f),
    )
}
