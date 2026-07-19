package com.cubesolverai.app.ui.capture

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke

/**
 * Draws a square guide with the same 3x3 / 15%-inset grid that [com.cubesolverai.app.colorutils.sample3x3Averages]
 * samples, so what the user frames in the viewfinder is exactly what gets read as sticker colors.
 */
@Composable
fun CaptureGuideOverlay(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val side = size.minDimension * 0.72f
        val left = (size.width - side) / 2f
        val top = (size.height - side) / 2f
        val cell = side / 3f
        val pad = cell * 0.15f
        val guideColor = Color.White.copy(alpha = 0.85f)
        val strokeWidth = 3f

        // Outer square
        drawRect(
            color = guideColor,
            topLeft = Offset(left, top),
            size = androidx.compose.ui.geometry.Size(side, side),
            style = Stroke(width = strokeWidth),
        )

        // 9 sampling cells (inset by the same padding the color sampler uses)
        for (row in 0..2) {
            for (col in 0..2) {
                val cellLeft = left + col * cell + pad
                val cellTop = top + row * cell + pad
                val cellSide = cell - pad * 2
                drawRect(
                    color = guideColor.copy(alpha = 0.5f),
                    topLeft = Offset(cellLeft, cellTop),
                    size = androidx.compose.ui.geometry.Size(cellSide, cellSide),
                    style = Stroke(width = strokeWidth / 2f),
                )
            }
        }
    }
}
