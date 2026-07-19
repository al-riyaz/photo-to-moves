package com.cubesolverai.app.ui.solution

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.runtime.remember
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import com.cubesolverai.app.ui.colorgrid.stickerColor

private val TANGENTS: Map<Axis, Pair<Vec3, Vec3>> = mapOf(
    Axis.X to (Vec3(0f, 1f, 0f) to Vec3(0f, 0f, 1f)),
    Axis.Y to (Vec3(1f, 0f, 0f) to Vec3(0f, 0f, 1f)),
    Axis.Z to (Vec3(1f, 0f, 0f) to Vec3(0f, 1f, 0f)),
)

private fun axisOf(normal: Vec3): Axis = when {
    normal.x != 0f -> Axis.X
    normal.y != 0f -> Axis.Y
    else -> Axis.Z
}

private const val STICKER_HALF = 0.42f
private const val FACE_OFFSET = 0.5f

/**
 * Renders the cube's 54 stickers with a fixed isometric camera. Stickers flagged as moving are
 * additionally rotated by [activeRotation] * [progress] degrees around its axis before the
 * camera transform, animating a single layer turn.
 */
@Composable
fun CubeCanvas(
    stickers: List<Sticker>,
    activeRotation: Pair<Axis, Float>?,
    progress: Float,
    modifier: Modifier = Modifier,
    camera: Camera = remember3DCamera(),
) {
    Canvas(modifier = modifier) {
        val scale = size.minDimension / 4.2f
        val center = Offset(size.width / 2f, size.height / 2f)

        data class Projected(val depth: Float, val points: List<Offset>, val color: androidx.compose.ui.graphics.Color)

        val projected = stickers.map { sticker ->
            val worldPos: Vec3
            val worldNormal: Vec3
            if (sticker.isMoving && activeRotation != null) {
                val (axis, degrees) = activeRotation
                worldPos = rotateAxis(sticker.homePos, axis, degrees * progress)
                worldNormal = rotateAxis(sticker.faceNormal, axis, degrees * progress)
            } else {
                worldPos = sticker.homePos
                worldNormal = sticker.faceNormal
            }

            val faceCenter = worldPos + worldNormal * FACE_OFFSET
            val axis = axisOf(sticker.faceNormal)
            val (t1, t2) = TANGENTS.getValue(axis)
            val rotT1: Vec3
            val rotT2: Vec3
            if (sticker.isMoving && activeRotation != null) {
                val (rAxis, degrees) = activeRotation
                rotT1 = rotateAxis(t1, rAxis, degrees * progress)
                rotT2 = rotateAxis(t2, rAxis, degrees * progress)
            } else {
                rotT1 = t1
                rotT2 = t2
            }

            val corners3D = listOf(
                faceCenter + rotT1 * STICKER_HALF + rotT2 * STICKER_HALF,
                faceCenter + rotT1 * STICKER_HALF - rotT2 * STICKER_HALF,
                faceCenter - rotT1 * STICKER_HALF - rotT2 * STICKER_HALF,
                faceCenter - rotT1 * STICKER_HALF + rotT2 * STICKER_HALF,
            ).map { camera.toViewSpace(it) }

            val points = corners3D.map { p -> Offset(center.x + p.x * scale, center.y - p.y * scale) }
            val avgDepth = corners3D.sumOf { it.z.toDouble() }.toFloat() / corners3D.size
            Projected(avgDepth, points, stickerColor(sticker.color))
        }.sortedBy { it.depth } // painter's algorithm: farthest (smallest view-space z) first

        for (p in projected) {
            val path = Path().apply {
                moveTo(p.points[0].x, p.points[0].y)
                for (i in 1 until p.points.size) lineTo(p.points[i].x, p.points[i].y)
                close()
            }
            drawPath(path, color = p.color)
            drawPath(path, color = androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.35f), style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.5f))
        }
    }
}

@Composable
private fun remember3DCamera(): Camera = remember { Camera() }
