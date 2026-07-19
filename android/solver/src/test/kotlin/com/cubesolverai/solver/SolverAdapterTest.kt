package com.cubesolverai.solver

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SolverAdapterTest {

    private val solvedFacelets =
        "UUUUUUUUU" + "RRRRRRRRR" + "FFFFFFFFF" + "DDDDDDDDD" + "LLLLLLLLL" + "BBBBBBBBB"

    @Test
    fun `facelet string round-trips through CubeModel`() {
        val cube = CubeModel.fromFaceletString(solvedFacelets)
        assertEquals(solvedFacelets, cube.asFaceletString())
        assertTrue(cube.isSolved())
    }

    @Test
    fun `scrambled cube round-trips through facelet string`() {
        val cube = CubeModel()
        cube.applyAlgorithm("R U R' U' F2 D L B' U2 R2")
        val facelets = cube.asFaceletString()
        val reparsed = CubeModel.fromFaceletString(facelets)
        assertEquals(facelets, reparsed.asFaceletString())
        assertFalse(reparsed.isSolved())
    }

    @Test
    fun `already solved cube solves instantly with empty solution`() {
        val result = SolverAdapter.solve(solvedFacelets)
        assertTrue(result.isSuccess)
        assertEquals("", result.getOrThrow())
    }

    @Test
    fun `malformed color counts are rejected`() {
        val bad = "U".repeat(54) // all white - not 9 of each
        val result = SolverAdapter.solve(bad)
        assertTrue(result.isFailure)
    }

    @Test
    fun `wrong length facelet string is rejected`() {
        val result = SolverAdapter.solve("UUU")
        assertTrue(result.isFailure)
    }

    @Test
    fun `physically impossible single edge flip is rejected`() {
        val cube = CubeModel.fromFaceletString(solvedFacelets)
        cube.eo[0] = 1 // flip a single edge in place - impossible on a real cube
        val result = SolverAdapter.solve(cube.asFaceletString())
        assertTrue(result.isFailure)
    }

    @Test
    fun `solves a known scramble and the solution actually solves the cube`() {
        SolverAdapter.initialize()

        val scramble = "R U R' U' F2 D L B' U2 R2 F' L2 D' B U R2 F D2 L' U'"
        val scrambled = CubeModel()
        scrambled.applyAlgorithm(scramble)
        val facelets = scrambled.asFaceletString()

        val result = SolverAdapter.solve(facelets)
        assertTrue("solve should succeed: ${result.exceptionOrNull()}", result.isSuccess)
        val solution = result.getOrThrow()
        assertTrue(solution.isNotEmpty())

        // Applying the solution to the same scrambled state must fully solve it.
        val verify = CubeModel.fromFaceletString(facelets)
        verify.applyAlgorithm(solution)
        assertTrue("cube should be solved after applying: $solution", verify.isSolved())
    }

    @Test
    fun `solves several random scrambles`() {
        SolverAdapter.initialize()
        val scrambles = listOf(
            "F U2 B2 L2 D R2 U' F2 D2 B' L D' L2 B R' F D2 R B2",
            "D2 L2 F2 U' R2 D B2 U2 F2 D2 L' B D' R F' U R2 D' L2",
            "U D' R L' F B' U D' L2 R2 F2 B2 U2 D2",
        )
        for (scramble in scrambles) {
            val cube = CubeModel()
            cube.applyAlgorithm(scramble)
            val facelets = cube.asFaceletString()
            val result = SolverAdapter.solve(facelets)
            assertTrue("scramble '$scramble' should solve: ${result.exceptionOrNull()}", result.isSuccess)
            val verify = CubeModel.fromFaceletString(facelets)
            verify.applyAlgorithm(result.getOrThrow())
            assertTrue("scramble '$scramble' should end solved", verify.isSolved())
        }
    }
}
