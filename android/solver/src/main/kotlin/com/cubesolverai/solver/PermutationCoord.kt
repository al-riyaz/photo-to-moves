package com.cubesolverai.solver

/** n choose k. */
internal fun cnk(n: Int, k: Int): Int {
    if (n < k) return 0
    var kk = k
    if (kk > n / 2) kk = n - kk
    var s = 1L
    var i = n.toLong()
    var j = 1L
    while (i != (n - kk).toLong()) {
        s *= i
        s /= j
        i--
        j++
    }
    return s.toInt()
}

internal fun factorial(n: Int): Int {
    var f = 1
    for (i in 2..n) f *= i
    return f
}

private fun rotateLeft(arr: IntArray, l: Int, r: Int) {
    val tmp = arr[l]
    for (i in l until r) arr[i] = arr[i + 1]
    arr[r] = tmp
}

private fun rotateRight(arr: IntArray, l: Int, r: Int) {
    val tmp = arr[r]
    for (i in r downTo l + 1) arr[i] = arr[i - 1]
    arr[l] = tmp
}

/**
 * Encodes/decodes a permutation-index coordinate: which `maxOur+1` cubies (of piece indices
 * [start..end]) occupy which positions, combined with which positions they occupy among all
 * `maxAll+1` cubies of that type (corners or edges). Direct port of cube.js's
 * `permutationIndex(context, start, end, fromEnd)`.
 */
internal class PermutationCoord(
    private val corners: Boolean,
    private val start: Int,
    private val end: Int,
    private val fromEnd: Boolean = false,
) {
    private val maxOur = end - start
    private val maxB = factorial(maxOur + 1)
    private val maxAll = if (corners) 7 else 11
    private val our = IntArray(maxOur + 1)

    private fun perm(cube: CubeModel): IntArray = if (corners) cube.cp else cube.ep

    fun get(cube: CubeModel): Int {
        val p = perm(cube)
        for (i in 0..maxOur) our[i] = -1
        var a = 0
        var x = 0
        if (fromEnd) {
            for (j in maxAll downTo 0) {
                val v = p[j]
                if (v in start..end) {
                    a += cnk(maxAll - j, x + 1)
                    our[maxOur - x] = v
                    x++
                }
            }
        } else {
            for (j in 0..maxAll) {
                val v = p[j]
                if (v in start..end) {
                    a += cnk(j, x + 1)
                    our[x] = v
                    x++
                }
            }
        }
        var b = 0
        for (j in maxOur downTo 0) {
            var k = 0
            while (our[j] != start + j) {
                rotateLeft(our, 0, j)
                k++
            }
            b = (j + 1) * b + k
        }
        return a * maxB + b
    }

    fun set(cube: CubeModel, index: Int) {
        for (i in 0..maxOur) our[i] = i + start
        var b = index % maxB
        var a = index / maxB
        val p = perm(cube)
        for (i in 0..maxAll) p[i] = -1
        for (j in 1..maxOur) {
            var k = b % (j + 1)
            b /= (j + 1)
            while (k > 0) {
                rotateRight(our, 0, j)
                k--
            }
        }
        var x = maxOur
        if (fromEnd) {
            for (j in 0..maxAll) {
                val c = cnk(maxAll - j, x + 1)
                if (a - c >= 0) {
                    p[j] = our[maxOur - x]
                    a -= c
                    x--
                }
            }
        } else {
            for (j in maxAll downTo 0) {
                val c = cnk(j, x + 1)
                if (a - c >= 0) {
                    p[j] = our[x]
                    a -= c
                    x--
                }
            }
        }
    }
}

internal fun CubeModel.twistGet(): Int {
    var v = 0
    for (i in 0..6) v = 3 * v + co[i]
    return v
}

internal fun CubeModel.twistSet(twist: Int) {
    var t = twist
    var parity = 0
    for (i in 6 downTo 0) {
        val ori = t % 3
        t /= 3
        co[i] = ori
        parity += ori
    }
    co[7] = (3 - parity % 3) % 3
}

internal fun CubeModel.flipGet(): Int {
    var v = 0
    for (i in 0..10) v = 2 * v + eo[i]
    return v
}

internal fun CubeModel.flipSet(flip: Int) {
    var f = flip
    var parity = 0
    for (i in 10 downTo 0) {
        val ori = f % 2
        f /= 2
        eo[i] = ori
        parity += ori
    }
    eo[11] = (2 - parity % 2) % 2
}

internal fun CubeModel.cornerParityValue(): Int {
    var s = 0
    for (i in DRB downTo URF + 1) {
        for (j in i - 1 downTo URF) {
            if (cp[j] > cp[i]) s++
        }
    }
    return s % 2
}

internal fun CubeModel.edgeParityValue(): Int {
    var s = 0
    for (i in BR downTo UR + 1) {
        for (j in i - 1 downTo UR) {
            if (ep[j] > ep[i]) s++
        }
    }
    return s % 2
}

internal val URFtoDLFCoord = PermutationCoord(true, URF, DLF)
internal val URtoULCoord = PermutationCoord(false, UR, UL)
internal val UBtoDFCoord = PermutationCoord(false, UB, DF)
internal val URtoDFCoord = PermutationCoord(false, UR, DF)
internal val FRtoBRCoord = PermutationCoord(false, FR, BR, fromEnd = true)
