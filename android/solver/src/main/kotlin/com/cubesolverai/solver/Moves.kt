package com.cubesolverai.solver

/**
 * The 12 move definitions needed at runtime: the 6 face turns (U,R,F,D,L,B), the 3 slice
 * turns (E,M,S) used only to bootstrap the whole-cube rotations, and the 3 whole-cube
 * rotations (x,y,z) used by [CubeModel.upright]. Transcribed 1:1 from cube.js's `Cube.moves`.
 */
internal object Moves {
    val all: Array<MoveDef> by lazy { buildMoves() }

    private fun buildMoves(): Array<MoveDef> {
        val u = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB),
            co = IntArray(8),
            ep = intArrayOf(UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR),
            eo = IntArray(12),
        )
        val r = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR),
            co = intArrayOf(2, 0, 0, 1, 1, 0, 0, 2),
            ep = intArrayOf(FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR),
            eo = IntArray(12),
        )
        val f = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB),
            co = intArrayOf(1, 2, 0, 0, 2, 1, 0, 0),
            ep = intArrayOf(UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR),
            eo = intArrayOf(0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0),
        )
        val d = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR),
            co = IntArray(8),
            ep = intArrayOf(UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR),
            eo = IntArray(12),
        )
        val l = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB),
            co = intArrayOf(0, 1, 2, 0, 0, 2, 1, 0),
            ep = intArrayOf(UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR),
            eo = IntArray(12),
        )
        val b = MoveDef(
            center = intArrayOf(0, 1, 2, 3, 4, 5),
            cp = intArrayOf(URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL),
            co = intArrayOf(0, 0, 1, 2, 0, 0, 2, 1),
            ep = intArrayOf(UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB),
            eo = intArrayOf(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1),
        )
        val e = MoveDef(
            center = intArrayOf(U, F, L, D, B, R),
            cp = intArrayOf(URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB),
            co = IntArray(8),
            ep = intArrayOf(UR, UF, UL, UB, DR, DF, DL, DB, FL, BL, BR, FR),
            eo = intArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1),
        )
        val m = MoveDef(
            center = intArrayOf(B, R, U, F, L, D),
            cp = intArrayOf(URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB),
            co = IntArray(8),
            ep = intArrayOf(UR, UB, UL, DB, DR, UF, DL, DF, FR, FL, BL, BR),
            eo = intArrayOf(0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0),
        )
        val s = MoveDef(
            center = intArrayOf(L, U, F, R, D, B),
            cp = intArrayOf(URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB),
            co = IntArray(8),
            ep = intArrayOf(UL, UF, DL, UB, UR, DF, DR, DB, FR, FL, BL, BR),
            eo = intArrayOf(1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0),
        )

        val x = compose(r, 0, m, 2, l, 2) // x = R M' L'
        val y = compose(u, 0, e, 2, d, 2) // y = U E' D'
        val z = compose(f, 0, s, 0, b, 2) // z = F S B'

        return arrayOf(u, r, f, d, l, b, e, m, s, x, y, z)
    }

    private fun compose(vararg movesAndPowers: Any): MoveDef {
        val cube = CubeModel()
        var i = 0
        while (i < movesAndPowers.size) {
            val move = movesAndPowers[i] as MoveDef
            val power = movesAndPowers[i + 1] as Int
            repeat(power + 1) { cube.multiply(move) }
            i += 2
        }
        return MoveDef(cube.center.copyOf(), cube.cp.copyOf(), cube.co.copyOf(), cube.ep.copyOf(), cube.eo.copyOf())
    }
}
