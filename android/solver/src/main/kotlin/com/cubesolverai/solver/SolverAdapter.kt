package com.cubesolverai.solver

private val FACE_LETTERS = charArrayOf('U', 'R', 'F', 'D', 'L', 'B')

/**
 * Public entry point for the rest of the app. Wraps [TwoPhaseSolver] with the input
 * validation a photo-derived facelet string actually needs: malformed color counts and
 * physically-impossible cube states (single flipped edge, single twisted corner, swapped
 * pair, etc.) must fail fast with a clear message rather than let the search run unbounded.
 */
object SolverAdapter {

    /** Computes the (expensive, ~seconds) move/pruning tables. Call once, off the main thread. */
    fun initialize() {
        TwoPhaseSolver.initSolver()
    }

    val isInitialized: Boolean
        get() = TwoPhaseSolver.isInitialized

    /**
     * Solves a 54-character facelet string (U,R,F,D,L,B order, 9 chars each, row-major -
     * the same convention the web app's buildFaceletsString produces).
     *
     * Returns the solution as a space-separated move string (e.g. "R U R' U2 F ..."),
     * or "" if the cube is already solved.
     */
    fun solve(facelets: String, maxDepth: Int = 22, timeoutMillis: Long = 20_000L): Result<String> {
        validateFaceletCounts(facelets)?.let { return Result.failure(IllegalArgumentException(it)) }

        val cube = try {
            CubeModel.fromFaceletString(facelets)
        } catch (e: Exception) {
            return Result.failure(IllegalArgumentException("Could not read cube colors: ${e.message}"))
        }

        validateCubeState(cube)?.let { return Result.failure(IllegalArgumentException(it)) }

        if (cube.isSolved()) return Result.success("")

        if (!isInitialized) initialize()

        val solution = TwoPhaseSolver.solve(cube, maxDepth, timeoutMillis)
            ?: return Result.failure(
                IllegalStateException("Couldn't find a solution. Double-check your scanned colors and try again."),
            )
        return Result.success(solution)
    }

    /** Mirrors the web app's validateFaceletCounts: each of U/R/F/D/L/B must appear exactly 9 times. */
    internal fun validateFaceletCounts(facelets: String): String? {
        if (facelets.length != 54) return "Expected 54 facelets, got ${facelets.length}."
        val counts = IntArray(6)
        for (ch in facelets) {
            val idx = FACE_LETTERS.indexOf(ch)
            if (idx < 0) return "Invalid color letter: $ch"
            counts[idx]++
        }
        val problems = counts.indices.filter { counts[it] != 9 }
        if (problems.isNotEmpty()) {
            val detail = problems.joinToString(", ") { "${FACE_LETTERS[it]}=${counts[it]}" }
            return "Each face color must appear 9 times: $detail"
        }
        return null
    }

    /** Necessary-and-sufficient solvability conditions for a physical Rubik's cube. */
    internal fun validateCubeState(cube: CubeModel): String? {
        if (!isPermutation(cube.cp, 8)) return "Invalid cube state: corner colors don't form a valid cube."
        if (!isPermutation(cube.ep, 12)) return "Invalid cube state: edge colors don't form a valid cube."
        if (cube.co.sum() % 3 != 0) {
            return "Invalid cube state: a corner sticker looks misread (impossible corner twist)."
        }
        if (cube.eo.sum() % 2 != 0) {
            return "Invalid cube state: an edge sticker looks misread (impossible edge flip)."
        }
        if (cube.cornerParityValue() != cube.edgeParityValue()) {
            return "Invalid cube state: two stickers look swapped (impossible piece arrangement)."
        }
        return null
    }

    private fun isPermutation(arr: IntArray, size: Int): Boolean {
        if (arr.size != size) return false
        val seen = BooleanArray(size)
        for (v in arr) {
            if (v !in 0 until size || seen[v]) return false
            seen[v] = true
        }
        return true
    }
}
