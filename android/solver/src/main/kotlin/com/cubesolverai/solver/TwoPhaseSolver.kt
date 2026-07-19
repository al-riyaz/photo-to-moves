package com.cubesolverai.solver

import kotlin.math.max

internal const val N_TWIST = 2187
internal const val N_FLIP = 2048
internal const val N_PARITY = 2
internal const val N_FRtoBR = 11880
internal const val N_SLICE1 = 495
internal const val N_SLICE2 = 24
internal const val N_URFtoDLF = 20160
internal const val N_URtoDF = 20160
internal const val N_URtoUL = 1320
internal const val N_UBtoDF = 1320

// Phase 1: all 18 quarter/half turns of the 6 faces are legal.
private val ALL_MOVES_1 = IntArray(18) { it }

// Phase 2: only half turns of R,F,L,B plus any turn of U,D.
private val ALL_MOVES_2 = intArrayOf(0, 1, 2, 4, 7, 9, 10, 11, 13, 16)
private val IS_PHASE2_MOVE = BooleanArray(18).also { arr -> ALL_MOVES_2.forEach { arr[it] = true } }

private val NEXT_MOVES_1: Array<IntArray> = Array(6) { lastFace ->
    val next = mutableListOf<Int>()
    for (face in 0..5) {
        if (face != lastFace && face != lastFace - 3) {
            for (power in 0..2) next.add(face * 3 + power)
        }
    }
    next.toIntArray()
}

private val NEXT_MOVES_2: Array<IntArray> = Array(6) { lastFace ->
    val next = mutableListOf<Int>()
    for (face in 0..5) {
        if (face != lastFace && face != lastFace - 3) {
            val powers = if (face == U || face == D) intArrayOf(0, 1, 2) else intArrayOf(1)
            for (power in powers) next.add(face * 3 + power)
        }
    }
    next.toIntArray()
}

private val MOVE_NAMES: Array<String> = run {
    val faceNames = arrayOf("U", "R", "F", "D", "L", "B")
    val powerNames = arrayOf("", "2", "'")
    Array(18) { idx -> faceNames[idx / 3] + powerNames[idx % 3] }
}

// 8 values (0..15) packed per Int32.
private fun pruningGet(table: IntArray, index: Int): Int {
    val slot = index shr 3
    val shift = (index and 7) shl 2
    return (table[slot] ushr shift) and 0xF
}

private fun pruningSet(table: IntArray, index: Int, value: Int) {
    val slot = index shr 3
    val shift = (index and 7) shl 2
    table[slot] = (table[slot] and (0xF shl shift).inv()) or (value shl shift)
}

private fun computeMoveTable(
    corners: Boolean,
    size: Int,
    get: (CubeModel) -> Int,
    set: (CubeModel, Int) -> Unit,
): Array<IntArray> {
    val cube = CubeModel()
    val result = Array(size) { IntArray(18) }
    for (i in 0 until size) {
        set(cube, i)
        for (face in 0..5) {
            val move = Moves.all[face]
            for (power in 0..2) {
                if (corners) cube.cornerMultiply(move) else cube.edgeMultiply(move)
                result[i][face * 3 + power] = get(cube)
            }
            // 4th application restores the cube for this face.
            if (corners) cube.cornerMultiply(move) else cube.edgeMultiply(move)
        }
    }
    return result
}

private fun computePruningTable(
    phase: Int,
    size: Int,
    currentCoords: (Int) -> IntArray,
    nextIndex: (IntArray, Int) -> Int,
): IntArray {
    val table = IntArray((size + 7) / 8) { -1 } // all nibbles = 0xF (unreached)
    val moves = if (phase == 1) ALL_MOVES_1 else ALL_MOVES_2
    var depth = 0
    pruningSet(table, 0, 0)
    var done = 1
    while (done != size) {
        for (index in 0 until size) {
            if (pruningGet(table, index) != depth) continue
            val current = currentCoords(index)
            for (move in moves) {
                val next = nextIndex(current, move)
                if (pruningGet(table, next) == 0xF) {
                    pruningSet(table, next, depth + 1)
                    done++
                }
            }
        }
        depth++
    }
    return table
}

/** Thrown internally when a solve exceeds its time budget (e.g. a malformed/invalid cube). */
internal class SolveTimeoutException : Exception()

private class SearchState {
    var parent: SearchState? = null
    var lastMove: Int = -1
    var depth: Int = 0

    // Phase 1 coordinates
    var flip = 0
    var twist = 0
    var slice = 0

    // Phase 2 coordinates
    var parity = 0
    var urfToDlf = 0
    var frToBr = 0
    var urToUl = 0
    var ubToDf = 0
    var urToDf = 0

    fun initFrom(cube: CubeModel) {
        parent = null
        lastMove = -1
        depth = 0
        flip = cube.flipGet()
        twist = cube.twistGet()
        slice = FRtoBRCoord.get(cube) / N_SLICE2
        parity = cube.cornerParityValue()
        urfToDlf = URFtoDLFCoord.get(cube)
        frToBr = FRtoBRCoord.get(cube)
        urToUl = URtoULCoord.get(cube)
        ubToDf = UBtoDFCoord.get(cube)
    }

    fun solutionString(): String {
        val moves = mutableListOf<Int>()
        var s: SearchState? = this
        while (s?.parent != null) {
            moves.add(s.lastMove)
            s = s.parent
        }
        moves.reverse()
        return moves.joinToString(" ") { MOVE_NAMES[it] }
    }

    fun moves1(): IntArray = if (lastMove >= 0) NEXT_MOVES_1[lastMove / 3] else ALL_MOVES_1
    fun moves2(): IntArray = if (lastMove >= 0) NEXT_MOVES_2[lastMove / 3] else ALL_MOVES_2

    fun minDist1(tables: SolverTables): Int {
        val d1 = pruningGet(tables.sliceFlipPrun, N_SLICE1 * flip + slice)
        val d2 = pruningGet(tables.sliceTwistPrun, N_SLICE1 * twist + slice)
        return max(d1, d2)
    }

    fun next1(move: Int, tables: SolverTables, pool: ArrayDeque<SearchState>): SearchState {
        val next = pool.removeLast()
        next.parent = this
        next.lastMove = move
        next.depth = depth + 1
        next.flip = tables.flipTable[flip][move]
        next.twist = tables.twistTable[twist][move]
        next.slice = tables.frToBrTable[slice * 24][move] / 24
        return next
    }

    fun minDist2(tables: SolverTables): Int {
        val index1 = (N_SLICE2 * urToDf + frToBr) * N_PARITY + parity
        val d1 = pruningGet(tables.sliceURtoDFParityPrun, index1)
        val index2 = (N_SLICE2 * urfToDlf + frToBr) * N_PARITY + parity
        val d2 = pruningGet(tables.sliceURFtoDLFParityPrun, index2)
        return max(d1, d2)
    }

    fun init2(tables: SolverTables, top: Boolean = true) {
        val p = parent ?: return
        p.init2(tables, top = false)
        urfToDlf = tables.urfToDlfTable[p.urfToDlf][lastMove]
        frToBr = tables.frToBrTable[p.frToBr][lastMove]
        parity = tables.parityTable[p.parity][lastMove]
        urToUl = tables.urToUlTable[p.urToUl][lastMove]
        ubToDf = tables.ubToDfTable[p.ubToDf][lastMove]
        if (top) {
            urToDf = tables.mergeUrToDfTable[urToUl][ubToDf]
        }
    }

    fun next2(move: Int, tables: SolverTables, pool: ArrayDeque<SearchState>): SearchState {
        val next = pool.removeLast()
        next.parent = this
        next.lastMove = move
        next.depth = depth + 1
        next.urfToDlf = tables.urfToDlfTable[urfToDlf][move]
        next.frToBr = tables.frToBrTable[frToBr][move]
        next.parity = tables.parityTable[parity][move]
        next.urToDf = tables.urToDfTable[urToDf][move]
        return next
    }
}

internal class SolverTables {
    lateinit var twistTable: Array<IntArray>
    lateinit var flipTable: Array<IntArray>
    lateinit var frToBrTable: Array<IntArray>
    lateinit var urfToDlfTable: Array<IntArray>
    lateinit var urToDfTable: Array<IntArray>
    lateinit var urToUlTable: Array<IntArray>
    lateinit var ubToDfTable: Array<IntArray>
    lateinit var mergeUrToDfTable: Array<IntArray>
    val parityTable = arrayOf(
        intArrayOf(1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1),
        intArrayOf(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0),
    )

    lateinit var sliceTwistPrun: IntArray
    lateinit var sliceFlipPrun: IntArray
    lateinit var sliceURFtoDLFParityPrun: IntArray
    lateinit var sliceURtoDFParityPrun: IntArray

    fun compute() {
        twistTable = computeMoveTable(true, N_TWIST, { it.twistGet() }, { c, i -> c.twistSet(i) })
        flipTable = computeMoveTable(false, N_FLIP, { it.flipGet() }, { c, i -> c.flipSet(i) })
        frToBrTable = computeMoveTable(false, N_FRtoBR, { FRtoBRCoord.get(it) }, { c, i -> FRtoBRCoord.set(c, i) })
        urfToDlfTable = computeMoveTable(true, N_URFtoDLF, { URFtoDLFCoord.get(it) }, { c, i -> URFtoDLFCoord.set(c, i) })
        urToDfTable = computeMoveTable(false, N_URtoDF, { URtoDFCoord.get(it) }, { c, i -> URtoDFCoord.set(c, i) })
        urToUlTable = computeMoveTable(false, N_URtoUL, { URtoULCoord.get(it) }, { c, i -> URtoULCoord.set(c, i) })
        ubToDfTable = computeMoveTable(false, N_UBtoDF, { UBtoDFCoord.get(it) }, { c, i -> UBtoDFCoord.set(c, i) })

        val a = CubeModel()
        val b = CubeModel()
        mergeUrToDfTable = Array(336) { urToUl ->
            IntArray(336) { ubToDf ->
                URtoULCoord.set(a, urToUl)
                UBtoDFCoord.set(b, ubToDf)
                var collision = false
                for (i in 0..7) {
                    if (a.ep[i] != -1) {
                        if (b.ep[i] != -1) {
                            collision = true
                            break
                        } else {
                            b.ep[i] = a.ep[i]
                        }
                    }
                }
                if (collision) -1 else URtoDFCoord.get(b)
            }
        }

        sliceTwistPrun = computePruningTable(
            phase = 1,
            size = N_SLICE1 * N_TWIST,
            currentCoords = { index -> intArrayOf(index % N_SLICE1, index / N_SLICE1) },
            nextIndex = { current, move ->
                val slice = current[0]; val twist = current[1]
                val newSlice = frToBrTable[slice * 24][move] / 24
                val newTwist = twistTable[twist][move]
                newTwist * N_SLICE1 + newSlice
            },
        )

        sliceFlipPrun = computePruningTable(
            phase = 1,
            size = N_SLICE1 * N_FLIP,
            currentCoords = { index -> intArrayOf(index % N_SLICE1, index / N_SLICE1) },
            nextIndex = { current, move ->
                val slice = current[0]; val flip = current[1]
                val newSlice = frToBrTable[slice * 24][move] / 24
                val newFlip = flipTable[flip][move]
                newFlip * N_SLICE1 + newSlice
            },
        )

        sliceURFtoDLFParityPrun = computePruningTable(
            phase = 2,
            size = N_SLICE2 * N_URFtoDLF * N_PARITY,
            currentCoords = { index -> intArrayOf(index % 2, (index / 2) % N_SLICE2, (index / 2) / N_SLICE2) },
            nextIndex = { current, move ->
                val parity = current[0]; val slice = current[1]; val urfToDlf = current[2]
                val newParity = parityTable[parity][move]
                val newSlice = frToBrTable[slice][move]
                val newUrfToDlf = urfToDlfTable[urfToDlf][move]
                (newUrfToDlf * N_SLICE2 + newSlice) * 2 + newParity
            },
        )

        sliceURtoDFParityPrun = computePruningTable(
            phase = 2,
            size = N_SLICE2 * N_URtoDF * N_PARITY,
            currentCoords = { index -> intArrayOf(index % 2, (index / 2) % N_SLICE2, (index / 2) / N_SLICE2) },
            nextIndex = { current, move ->
                val parity = current[0]; val slice = current[1]; val urToDf = current[2]
                val newParity = parityTable[parity][move]
                val newSlice = frToBrTable[slice][move]
                val newUrToDf = urToDfTable[urToDf][move]
                (newUrToDf * N_SLICE2 + newSlice) * 2 + newParity
            },
        )
    }
}

/**
 * Kotlin port of cube.js's solve.js (Herbert Kociemba's two-phase algorithm, without
 * symmetry reduction, exactly as cube.js implements it).
 */
object TwoPhaseSolver {
    private var tables: SolverTables? = null

    val isInitialized: Boolean
        get() = tables != null

    /** Computes the move/pruning tables. Expensive (a few seconds) - call on a background thread once. */
    @Synchronized
    fun initSolver() {
        if (tables != null) return
        val t = SolverTables()
        t.compute()
        tables = t
    }

    /**
     * Finds a solution (space-separated move string, "" if already solved, null if none found
     * within [maxDepth] or [timeoutMillis]).
     */
    fun solve(cube: CubeModel, maxDepth: Int = 22, timeoutMillis: Long = 20_000L): String? {
        val t = tables ?: error("TwoPhaseSolver.initSolver() must be called first")

        val clone = cube.clone()
        val uprightAlg = clone.upright()
        clone.applyAlgorithm(uprightAlg)

        val rotationCube = CubeModel()
        rotationCube.applyAlgorithm(uprightAlg)
        val rotation = rotationCube.center

        val uprightSolution = try {
            solveUpright(clone, t, maxDepth, timeoutMillis)
        } catch (e: SolveTimeoutException) {
            null
        } ?: return null

        if (uprightSolution.isEmpty()) return ""

        val faceNames = arrayOf("U", "R", "F", "D", "L", "B")
        val tokens = uprightSolution.split(' ')
        val result = StringBuilder()
        for ((i, move) in tokens.withIndex()) {
            if (i > 0) result.append(' ')
            val faceNum = FACE_CHAR_MAP.getValue(move[0])
            result.append(faceNames[rotation[faceNum]])
            if (move.length > 1) result.append(move[1])
        }
        return result.toString()
    }

    private fun solveUpright(cube: CubeModel, t: SolverTables, maxDepth: Int, timeoutMillis: Long): String? {
        val pool = ArrayDeque<SearchState>(maxDepth + 1)
        repeat(maxDepth + 1) { pool.addLast(SearchState()) }

        var solution: String? = null
        val deadlineNanos = System.nanoTime() + timeoutMillis * 1_000_000L
        var nodeCounter = 0

        fun checkDeadline() {
            nodeCounter++
            if (nodeCounter and 0xFFFF == 0 && System.nanoTime() > deadlineNanos) {
                throw SolveTimeoutException()
            }
        }

        fun phase2(state: SearchState, depth: Int) {
            if (solution != null) return
            checkDeadline()
            if (depth == 0) {
                if (state.minDist2(t) == 0) solution = state.solutionString()
                return
            }
            if (state.minDist2(t) > depth) return
            for (move in state.moves2()) {
                val next = state.next2(move, t, pool)
                phase2(next, depth - 1)
                pool.addLast(next)
                if (solution != null) return
            }
        }

        fun phase2search(state: SearchState) {
            state.init2(t)
            var depth = 1
            val limit = maxDepth - state.depth
            while (depth <= limit && solution == null) {
                phase2(state, depth)
                depth++
            }
        }

        fun phase1(state: SearchState, depth: Int) {
            if (solution != null) return
            checkDeadline()
            if (depth == 0) {
                if (state.minDist1(t) == 0) {
                    if (state.lastMove < 0 || !IS_PHASE2_MOVE[state.lastMove]) {
                        phase2search(state)
                    }
                }
                return
            }
            if (state.minDist1(t) > depth) return
            for (move in state.moves1()) {
                val next = state.next1(move, t, pool)
                phase1(next, depth - 1)
                pool.addLast(next)
                if (solution != null) return
            }
        }

        val root = pool.removeLast()
        root.initFrom(cube)

        var depth = 1
        while (depth <= maxDepth && solution == null) {
            phase1(root, depth)
            depth++
        }
        pool.addLast(root)

        return solution
    }
}
