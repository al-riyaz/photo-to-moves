package com.cubesolverai.app.colorutils

import com.cubesolverai.app.model.CubeFace
import org.junit.Assert.assertEquals
import org.junit.Test

class ColorUtilsTest {

    @Test
    fun `classifies canonical sticker colors correctly`() {
        assertEquals(CubeFace.U, classifyStickerColor(RGB(250, 250, 250))) // white
        assertEquals(CubeFace.D, classifyStickerColor(RGB(255, 217, 0))) // yellow
        assertEquals(CubeFace.L, classifyStickerColor(RGB(255, 166, 77))) // orange
        assertEquals(CubeFace.R, classifyStickerColor(RGB(165, 13, 13))) // red
        assertEquals(CubeFace.F, classifyStickerColor(RGB(40, 189, 90))) // green
        assertEquals(CubeFace.B, classifyStickerColor(RGB(43, 108, 238))) // blue
    }

    @Test
    fun `rotateGrid rotates a 3x3 grid clockwise`() {
        val grid = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9)
        val rotatedOnce = rotateGrid(grid, 1)
        assertEquals(listOf(7, 4, 1, 8, 5, 2, 9, 6, 3), rotatedOnce)
        val rotatedFour = rotateGrid(grid, 4)
        assertEquals(grid, rotatedFour)
    }

    @Test
    fun `rgbToHsv computes expected hue for pure red`() {
        val (h, s, v) = rgbToHsv(RGB(255, 0, 0))
        assertEquals(0f, h, 0.01f)
        assertEquals(1f, s, 0.01f)
        assertEquals(1f, v, 0.01f)
    }
}
