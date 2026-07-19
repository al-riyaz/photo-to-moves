package com.cubesolverai.app.ui.solution

import com.cubesolverai.app.model.CubeFace
import com.cubesolverai.solver.CubeModel

/** One visible colored square on the cube, in cube-local 3D space (units: cubie widths). */
data class Sticker(
    val homePos: Vec3,
    val faceNormal: Vec3,
    val color: CubeFace,
    val isMoving: Boolean,
)

private val NORMAL = mapOf(
    CubeFace.U to Vec3(0f, 1f, 0f),
    CubeFace.D to Vec3(0f, -1f, 0f),
    CubeFace.R to Vec3(1f, 0f, 0f),
    CubeFace.L to Vec3(-1f, 0f, 0f),
    CubeFace.F to Vec3(0f, 0f, 1f),
    CubeFace.B to Vec3(0f, 0f, -1f),
)

// Corner slot homes and their 3 sticker directions, in the same order as the solver's
// CORNER_COLOR table (URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB).
private val CORNER_HOME = listOf(
    Vec3(1f, 1f, 1f), Vec3(-1f, 1f, 1f), Vec3(-1f, 1f, -1f), Vec3(1f, 1f, -1f),
    Vec3(1f, -1f, 1f), Vec3(-1f, -1f, 1f), Vec3(-1f, -1f, -1f), Vec3(1f, -1f, -1f),
)
private val CORNER_DIRS = listOf(
    listOf(CubeFace.U, CubeFace.R, CubeFace.F),
    listOf(CubeFace.U, CubeFace.F, CubeFace.L),
    listOf(CubeFace.U, CubeFace.L, CubeFace.B),
    listOf(CubeFace.U, CubeFace.B, CubeFace.R),
    listOf(CubeFace.D, CubeFace.F, CubeFace.R),
    listOf(CubeFace.D, CubeFace.L, CubeFace.F),
    listOf(CubeFace.D, CubeFace.B, CubeFace.L),
    listOf(CubeFace.D, CubeFace.R, CubeFace.B),
)

// Edge slot homes and their 2 sticker directions, matching the solver's EDGE_COLOR order
// (UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR).
private val EDGE_HOME = listOf(
    Vec3(1f, 1f, 0f), Vec3(0f, 1f, 1f), Vec3(-1f, 1f, 0f), Vec3(0f, 1f, -1f),
    Vec3(1f, -1f, 0f), Vec3(0f, -1f, 1f), Vec3(-1f, -1f, 0f), Vec3(0f, -1f, -1f),
    Vec3(1f, 0f, 1f), Vec3(-1f, 0f, 1f), Vec3(-1f, 0f, -1f), Vec3(1f, 0f, -1f),
)
private val EDGE_DIRS = listOf(
    listOf(CubeFace.U, CubeFace.R), listOf(CubeFace.U, CubeFace.F), listOf(CubeFace.U, CubeFace.L), listOf(CubeFace.U, CubeFace.B),
    listOf(CubeFace.D, CubeFace.R), listOf(CubeFace.D, CubeFace.F), listOf(CubeFace.D, CubeFace.L), listOf(CubeFace.D, CubeFace.B),
    listOf(CubeFace.F, CubeFace.R), listOf(CubeFace.F, CubeFace.L), listOf(CubeFace.B, CubeFace.L), listOf(CubeFace.B, CubeFace.R),
)

private val CENTER_HOME = mapOf(
    CubeFace.U to Vec3(0f, 1f, 0f), CubeFace.R to Vec3(1f, 0f, 0f), CubeFace.F to Vec3(0f, 0f, 1f),
    CubeFace.D to Vec3(0f, -1f, 0f), CubeFace.L to Vec3(-1f, 0f, 0f), CubeFace.B to Vec3(0f, 0f, -1f),
)

/**
 * Builds the full list of 54 visible stickers from a solved-model snapshot (the same cp/co/ep/eo
 * state the solver already validated). [movingAxisValue] marks which stickers belong to the
 * layer currently being turned (null = nothing animating), e.g. (Axis.Y, 1f) for a U move.
 */
fun buildStickers(cube: CubeModel, movingLayer: Pair<Axis, Float>?): List<Sticker> {
    fun isMoving(home: Vec3): Boolean {
        val (axis, value) = movingLayer ?: return false
        val coord = when (axis) {
            Axis.X -> home.x
            Axis.Y -> home.y
            Axis.Z -> home.z
        }
        return coord == value
    }

    val stickers = mutableListOf<Sticker>()

    for (i in CORNER_HOME.indices) {
        val home = CORNER_HOME[i]
        val piece = cube.cp[i]
        val ori = cube.co[i]
        val moving = isMoving(home)
        for (m in 0..2) {
            val color = CORNER_DIRS[piece][((m - ori) % 3 + 3) % 3]
            val normal = NORMAL.getValue(CORNER_DIRS[i][m])
            stickers.add(Sticker(home, normal, color, moving))
        }
    }

    for (i in EDGE_HOME.indices) {
        val home = EDGE_HOME[i]
        val piece = cube.ep[i]
        val ori = cube.eo[i]
        val moving = isMoving(home)
        for (m in 0..1) {
            val color = EDGE_DIRS[piece][((m - ori) % 2 + 2) % 2]
            val normal = NORMAL.getValue(EDGE_DIRS[i][m])
            stickers.add(Sticker(home, normal, color, moving))
        }
    }

    for (face in CubeFace.entries) {
        val home = CENTER_HOME.getValue(face)
        stickers.add(Sticker(home, NORMAL.getValue(face), face, isMoving = false))
    }

    return stickers
}

/** Which axis/layer a move notation token (e.g. "R2", "U'") turns, for animation purposes. */
fun movingLayerForMove(move: String): Pair<Axis, Float> = when (move[0]) {
    'U' -> Axis.Y to 1f
    'D' -> Axis.Y to -1f
    'R' -> Axis.X to 1f
    'L' -> Axis.X to -1f
    'F' -> Axis.Z to 1f
    'B' -> Axis.Z to -1f
    else -> error("Invalid move: $move")
}

/** Inverts a move token: "2" stays the same, "'" is dropped, and a bare face gets "'" appended. */
fun invertMove(move: String): String = when {
    move.endsWith("2") -> move
    move.endsWith("'") -> move.dropLast(1)
    else -> move + "'"
}

/** Rotation axis + signed degrees a move token turns its layer through (forward direction). */
fun rotationForMove(move: String): Pair<Axis, Float> {
    val face = move[0]
    val axis = when (face) {
        'U', 'D' -> Axis.Y
        'R', 'L' -> Axis.X
        'F', 'B' -> Axis.Z
        else -> error("Invalid move: $move")
    }
    // Matches the solver's convention: U/R/F single turns = -90 deg; D/L/B single turns = +90 deg.
    val base = if (face == 'U' || face == 'R' || face == 'F') -90f else 90f
    val suffix = move.drop(1)
    val degrees = when (suffix) {
        "" -> base
        "2" -> base * 2f
        "'" -> -base
        else -> error("Invalid move: $move")
    }
    return axis to degrees
}
