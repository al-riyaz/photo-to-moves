package com.cubesolverai.solver

/**
 * Kotlin port of cube.js (MIT licensed, https://github.com/ldez/cubejs), the same library
 * the CubeSolver AI web app already ships. Facelet ordering, coordinate math and move
 * definitions are transcribed 1:1 from cube.js/solve.js so solver behaviour matches the
 * web app exactly. See android/THIRD_PARTY_LICENSES.md for attribution.
 */

// Centers
const val U = 0
const val R = 1
const val F = 2
const val D = 3
const val L = 4
const val B = 5

// Corners
const val URF = 0
const val UFL = 1
const val ULB = 2
const val UBR = 3
const val DFR = 4
const val DLF = 5
const val DBL = 6
const val DRB = 7

// Edges
const val UR = 0
const val UF = 1
const val UL = 2
const val UB = 3
const val DR = 4
const val DF = 5
const val DL = 6
const val DB = 7
const val FR = 8
const val FL = 9
const val BL = 10
const val BR = 11

// Extra "faces" used only for whole-cube reorientation (upright()) and bootstrapping x/y/z.
internal const val FACE_E = 6
internal const val FACE_M = 7
internal const val FACE_S = 8
internal const val FACE_X = 9
internal const val FACE_Y = 10
internal const val FACE_Z = 11

internal val FACE_CHAR_MAP: Map<Char, Int> = mapOf(
    'U' to U, 'R' to R, 'F' to F, 'D' to D, 'L' to L, 'B' to B,
    'E' to FACE_E, 'M' to FACE_M, 'S' to FACE_S,
    'x' to FACE_X, 'y' to FACE_Y, 'z' to FACE_Z,
)

// Facelet index tables: 54 facelets ordered U0..8 R0..8 F0..8 D0..8 L0..8 B0..8 (0-indexed),
// matching the exact diagram/order used by the web app's buildFaceletsString.
internal val CENTER_FACELET = intArrayOf(4, 13, 22, 31, 40, 49)

internal val CORNER_FACELET = arrayOf(
    intArrayOf(8, 9, 20),
    intArrayOf(6, 18, 38),
    intArrayOf(0, 36, 47),
    intArrayOf(2, 45, 11),
    intArrayOf(29, 26, 15),
    intArrayOf(27, 44, 24),
    intArrayOf(33, 53, 42),
    intArrayOf(35, 17, 51),
)

internal val EDGE_FACELET = arrayOf(
    intArrayOf(5, 10),
    intArrayOf(7, 19),
    intArrayOf(3, 37),
    intArrayOf(1, 46),
    intArrayOf(32, 16),
    intArrayOf(28, 25),
    intArrayOf(30, 43),
    intArrayOf(34, 52),
    intArrayOf(23, 12),
    intArrayOf(21, 41),
    intArrayOf(50, 39),
    intArrayOf(48, 14),
)

internal val CENTER_COLOR = charArrayOf('U', 'R', 'F', 'D', 'L', 'B')

internal val CORNER_COLOR = arrayOf(
    charArrayOf('U', 'R', 'F'),
    charArrayOf('U', 'F', 'L'),
    charArrayOf('U', 'L', 'B'),
    charArrayOf('U', 'B', 'R'),
    charArrayOf('D', 'F', 'R'),
    charArrayOf('D', 'L', 'F'),
    charArrayOf('D', 'B', 'L'),
    charArrayOf('D', 'R', 'B'),
)

internal val EDGE_COLOR = arrayOf(
    charArrayOf('U', 'R'),
    charArrayOf('U', 'F'),
    charArrayOf('U', 'L'),
    charArrayOf('U', 'B'),
    charArrayOf('D', 'R'),
    charArrayOf('D', 'F'),
    charArrayOf('D', 'L'),
    charArrayOf('D', 'B'),
    charArrayOf('F', 'R'),
    charArrayOf('F', 'L'),
    charArrayOf('B', 'L'),
    charArrayOf('B', 'R'),
)

/** The permutation/orientation effect of one elementary move, applied via [CubeModel.multiply]. */
internal class MoveDef(
    val center: IntArray,
    val cp: IntArray,
    val co: IntArray,
    val ep: IntArray,
    val eo: IntArray,
)

/** Mutable Rubik's cube state: center/corner/edge permutations + orientations. */
class CubeModel {
    var center = intArrayOf(0, 1, 2, 3, 4, 5)
        internal set
    var cp = intArrayOf(0, 1, 2, 3, 4, 5, 6, 7)
        internal set
    var co = IntArray(8)
        internal set
    var ep = intArrayOf(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)
        internal set
    var eo = IntArray(12)
        internal set

    private var newCenter = IntArray(6)
    private var newCp = IntArray(8)
    private var newCo = IntArray(8)
    private var newEp = IntArray(12)
    private var newEo = IntArray(12)

    fun copyFrom(other: CubeModel) {
        center = other.center.copyOf()
        cp = other.cp.copyOf()
        co = other.co.copyOf()
        ep = other.ep.copyOf()
        eo = other.eo.copyOf()
    }

    fun clone(): CubeModel = CubeModel().also { it.copyFrom(this) }

    internal fun centerMultiply(o: MoveDef) {
        for (to in 0..5) newCenter[to] = center[o.center[to]]
        val tmp = center; center = newCenter; newCenter = tmp
    }

    internal fun cornerMultiply(o: MoveDef) {
        for (to in 0..7) {
            val from = o.cp[to]
            newCp[to] = cp[from]
            newCo[to] = (co[from] + o.co[to]) % 3
        }
        val tmpCp = cp; cp = newCp; newCp = tmpCp
        val tmpCo = co; co = newCo; newCo = tmpCo
    }

    internal fun edgeMultiply(o: MoveDef) {
        for (to in 0..11) {
            val from = o.ep[to]
            newEp[to] = ep[from]
            newEo[to] = (eo[from] + o.eo[to]) % 2
        }
        val tmpEp = ep; ep = newEp; newEp = tmpEp
        val tmpEo = eo; eo = newEo; newEo = tmpEo
    }

    internal fun multiply(o: MoveDef) {
        centerMultiply(o)
        cornerMultiply(o)
        edgeMultiply(o)
    }

    fun applyMove(faceNum: Int, power: Int) {
        val move = Moves.all[faceNum]
        repeat(power + 1) { multiply(move) }
    }

    fun applyMoveIndex(moveIndex: Int) = applyMove(moveIndex / 3, moveIndex % 3)

    fun applyAlgorithm(alg: String) {
        val trimmed = alg.trim()
        if (trimmed.isEmpty()) return
        for (part in trimmed.split(Regex("\\s+"))) {
            if (part.isEmpty()) continue
            require(part.length <= 2) { "Invalid move: $part" }
            val faceNum = FACE_CHAR_MAP[part[0]] ?: error("Invalid move: $part")
            val power = when {
                part.length == 1 -> 0
                part[1] == '2' -> 1
                part[1] == '\'' -> 2
                else -> error("Invalid move: $part")
            }
            applyMove(faceNum, power)
        }
    }

    /** Whole-cube reorientation (as a move string) needed so centers sit in home position. */
    fun upright(): String {
        val clone = clone()
        val result = mutableListOf<String>()
        var i = 0
        while (i < 6 && clone.center[i] != F) i++
        when (i) {
            D -> result.add("x")
            U -> result.add("x'")
            B -> result.add("x2")
            R -> result.add("y")
            L -> result.add("y'")
        }
        if (result.isNotEmpty()) clone.applyAlgorithm(result[0])
        var j = 0
        while (j < 6 && clone.center[j] != U) j++
        when (j) {
            L -> result.add("z")
            R -> result.add("z'")
            D -> result.add("z2")
        }
        return result.joinToString(" ")
    }

    fun isSolved(): Boolean {
        val clone = clone()
        clone.applyAlgorithm(clone.upright())
        for (i in 0..5) if (clone.center[i] != i) return false
        for (i in 0..7) if (clone.cp[i] != i || clone.co[i] != 0) return false
        for (i in 0..11) if (clone.ep[i] != i || clone.eo[i] != 0) return false
        return true
    }

    fun asFaceletString(): String {
        val result = CharArray(54)
        for (i in 0..5) result[CENTER_FACELET[i]] = CENTER_COLOR[center[i]]
        for (i in 0..7) {
            val corner = cp[i]
            val ori = co[i]
            for (n in 0..2) {
                result[CORNER_FACELET[i][(n + ori) % 3]] = CORNER_COLOR[corner][n]
            }
        }
        for (i in 0..11) {
            val edge = ep[i]
            val ori = eo[i]
            for (n in 0..1) {
                result[EDGE_FACELET[i][(n + ori) % 2]] = EDGE_COLOR[edge][n]
            }
        }
        return String(result)
    }

    companion object {
        fun fromFaceletString(str: String): CubeModel {
            require(str.length == 54) { "Facelet string must be 54 characters, was ${str.length}" }
            val cube = CubeModel()
            for (i in 0..5) {
                for (j in 0..5) {
                    if (str[9 * i + 4] == CENTER_COLOR[j]) cube.center[i] = j
                }
            }
            for (i in 0..7) {
                var ori = 0
                while (ori <= 2) {
                    val ch = str[CORNER_FACELET[i][ori]]
                    if (ch == 'U' || ch == 'D') break
                    ori++
                }
                val col1 = str[CORNER_FACELET[i][(ori + 1) % 3]]
                val col2 = str[CORNER_FACELET[i][(ori + 2) % 3]]
                for (j in 0..7) {
                    if (col1 == CORNER_COLOR[j][1] && col2 == CORNER_COLOR[j][2]) {
                        cube.cp[i] = j
                        cube.co[i] = ori % 3
                    }
                }
            }
            for (i in 0..11) {
                for (j in 0..11) {
                    if (str[EDGE_FACELET[i][0]] == EDGE_COLOR[j][0] && str[EDGE_FACELET[i][1]] == EDGE_COLOR[j][1]) {
                        cube.ep[i] = j
                        cube.eo[i] = 0
                        break
                    }
                    if (str[EDGE_FACELET[i][0]] == EDGE_COLOR[j][1] && str[EDGE_FACELET[i][1]] == EDGE_COLOR[j][0]) {
                        cube.ep[i] = j
                        cube.eo[i] = 1
                        break
                    }
                }
            }
            return cube
        }
    }
}
