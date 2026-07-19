package com.cubesolverai.app.ui.solution

import com.cubesolverai.app.model.CubeFace
import com.cubesolverai.solver.CubeModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class Cube3DGeometryTest {

    private val solvedFacelets =
        "UUUUUUUUU" + "RRRRRRRRR" + "FFFFFFFFF" + "DDDDDDDDD" + "LLLLLLLLL" + "BBBBBBBBB"

    @Test
    fun `solved cube produces 54 stickers with 9 of each color`() {
        val cube = CubeModel.fromFaceletString(solvedFacelets)
        val stickers = buildStickers(cube, movingLayer = null)
        assertEquals(54, stickers.size)
        for (face in CubeFace.entries) {
            assertEquals(9, stickers.count { it.color == face })
        }
    }

    @Test
    fun `solved cube stickers face the direction matching their own color`() {
        // On a solved cube every sticker's outward normal should match its color's home face
        // (e.g. every white sticker faces +Y). If this were wrong the rendered cube would look
        // visibly scrambled even though the solver's underlying state is solved.
        val cube = CubeModel.fromFaceletString(solvedFacelets)
        val stickers = buildStickers(cube, movingLayer = null)
        val expectedNormal = mapOf(
            CubeFace.U to Vec3(0f, 1f, 0f),
            CubeFace.D to Vec3(0f, -1f, 0f),
            CubeFace.R to Vec3(1f, 0f, 0f),
            CubeFace.L to Vec3(-1f, 0f, 0f),
            CubeFace.F to Vec3(0f, 0f, 1f),
            CubeFace.B to Vec3(0f, 0f, -1f),
        )
        for (sticker in stickers) {
            assertEquals("sticker of color ${sticker.color} at ${sticker.homePos}", expectedNormal.getValue(sticker.color), sticker.faceNormal)
        }
    }

    @Test
    fun `applying a move then its inverse restores the solved sticker layout`() {
        val cube = CubeModel.fromFaceletString(solvedFacelets)
        cube.applyAlgorithm("R U R' U' F2 D L B' U2 R2")
        val scrambled = cube.asFaceletString()

        val forward = CubeModel.fromFaceletString(scrambled)
        forward.applyAlgorithm("R")
        val back = forward.clone()
        back.applyAlgorithm(invertMove("R"))
        assertEquals(scrambled, back.asFaceletString())
    }

    @Test
    fun `invertMove matches expected notation`() {
        assertEquals("R'", invertMove("R"))
        assertEquals("R", invertMove("R'"))
        assertEquals("R2", invertMove("R2"))
    }

    @Test
    fun `rotationForMove signs are consistent with the solver's own move tables`() {
        // U (single) must rotate a corner from URF's home to UFL's home under rotateY.
        val (axis, degrees) = rotationForMove("U")
        assertEquals(Axis.Y, axis)
        val urfHome = Vec3(1f, 1f, 1f)
        val uflHome = Vec3(-1f, 1f, 1f)
        val rotated = rotateAxis(urfHome, axis, degrees)
        assertTrue("expected ~$uflHome, got $rotated", closeTo(rotated, uflHome))
    }

    private fun closeTo(a: Vec3, b: Vec3, eps: Float = 1e-3f): Boolean =
        kotlin.math.abs(a.x - b.x) < eps && kotlin.math.abs(a.y - b.y) < eps && kotlin.math.abs(a.z - b.z) < eps
}
