package com.cubesolverai.app.colorutils

import android.graphics.Bitmap
import com.cubesolverai.app.model.CubeFace
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * 1:1 Kotlin port of the web app's src/lib/color-utils.ts. Same downscale/padding constants
 * and HSV thresholds, so a photo classifies identically on both platforms. Do not "improve"
 * the thresholds here without also updating the web app - they were tuned empirically there.
 */
data class RGB(val r: Int, val g: Int, val b: Int)

fun rgbToHsv(rgb: RGB): Triple<Float, Float, Float> {
    val rn = rgb.r / 255f
    val gn = rgb.g / 255f
    val bn = rgb.b / 255f
    val maxV = max(rn, max(gn, bn))
    val minV = min(rn, min(gn, bn))
    val d = maxV - minV
    var h = 0f
    if (d != 0f) {
        h = when (maxV) {
            rn -> ((gn - bn) / d) % 6f
            gn -> (bn - rn) / d + 2f
            else -> (rn - gn) / d + 4f
        }
        h *= 60f
        if (h < 0f) h += 360f
    }
    val s = if (maxV == 0f) 0f else d / maxV
    val v = maxV
    return Triple(h, s, v)
}

/** Classify a sticker color into one of the 6 cube face letters using HSV. */
fun classifyStickerColor(rgb: RGB): CubeFace {
    val (h, s, v) = rgbToHsv(rgb)
    // White: low saturation, high value
    if (s < 0.25f && v > 0.55f) return CubeFace.U
    // Yellow: ~40-70
    if (h >= 40f && h < 70f) return CubeFace.D
    // Orange: brighter, more yellow-leaning hue (~18-40)
    if (h >= 18f && h < 40f) return CubeFace.L
    if (h < 18f || h >= 340f) {
        // Orange/red overlap zone (h 10-18): bright + less saturated -> orange; else red.
        if (h >= 10f && h < 18f && v > 0.75f && s < 0.85f) return CubeFace.L
        return CubeFace.R
    }
    // Green: 70-170
    if (h >= 70f && h < 170f) return CubeFace.F
    // Blue: 170-260
    if (h >= 170f && h < 260f) return CubeFace.B
    // Magenta-ish -> likely red under cool light
    return CubeFace.R
}

fun <T> rotateGrid(cells: List<T>, times: Int): List<T> {
    val t = ((times % 4) + 4) % 4
    var grid = cells
    repeat(t) {
        grid = listOf(
            grid[6], grid[3], grid[0],
            grid[7], grid[4], grid[1],
            grid[8], grid[5], grid[2],
        )
    }
    return grid
}

/** Downscales to max 768px, splits into a 3x3 grid, averages RGB over the center 70% of each cell. */
fun sample3x3Averages(bitmap: Bitmap): List<RGB> {
    val maxDim = 768
    var w = bitmap.width
    var h = bitmap.height
    if (w > maxDim || h > maxDim) {
        if (w > h) {
            h = ((h.toLong() * maxDim) / w).toInt()
            w = maxDim
        } else {
            w = ((w.toLong() * maxDim) / h).toInt()
            h = maxDim
        }
    }
    val scaled = if (w == bitmap.width && h == bitmap.height) {
        bitmap
    } else {
        Bitmap.createScaledBitmap(bitmap, w, h, true)
    }

    val cellW = w / 3
    val cellH = h / 3
    val padX = (cellW * 0.15).toInt()
    val padY = (cellH * 0.15).toInt()

    val result = mutableListOf<RGB>()
    for (row in 0..2) {
        for (col in 0..2) {
            val x = col * cellW + padX
            val y = row * cellH + padY
            val sw = max(1, cellW - padX * 2)
            val sh = max(1, cellH - padY * 2)
            result.add(averageColor(scaled, x, y, sw, sh))
        }
    }
    if (scaled !== bitmap) scaled.recycle()
    return result
}

private fun averageColor(bitmap: Bitmap, x: Int, y: Int, w: Int, h: Int): RGB {
    val clampedW = min(w, bitmap.width - x)
    val clampedH = min(h, bitmap.height - y)
    val pixels = IntArray(clampedW * clampedH)
    bitmap.getPixels(pixels, 0, clampedW, x, y, clampedW, clampedH)
    var rSum = 0L
    var gSum = 0L
    var bSum = 0L
    for (p in pixels) {
        rSum += (p shr 16) and 0xFF
        gSum += (p shr 8) and 0xFF
        bSum += p and 0xFF
    }
    val total = pixels.size.coerceAtLeast(1)
    return RGB(
        (rSum.toDouble() / total).roundToInt(),
        (gSum.toDouble() / total).roundToInt(),
        (bSum.toDouble() / total).roundToInt(),
    )
}
