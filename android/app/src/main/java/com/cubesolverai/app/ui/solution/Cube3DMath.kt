package com.cubesolverai.app.ui.solution

import kotlin.math.cos
import kotlin.math.sin

data class Vec3(val x: Float, val y: Float, val z: Float) {
    operator fun plus(o: Vec3) = Vec3(x + o.x, y + o.y, z + o.z)
    operator fun minus(o: Vec3) = Vec3(x - o.x, y - o.y, z - o.z)
    operator fun times(s: Float) = Vec3(x * s, y * s, z * s)
}

private fun deg2rad(deg: Float) = deg * (Math.PI.toFloat() / 180f)

/** Rotation about +X axis, matching the solver's move convention: R (single) = rotateX(v, -90). */
fun rotateX(v: Vec3, degrees: Float): Vec3 {
    val r = deg2rad(degrees)
    val c = cos(r)
    val s = sin(r)
    return Vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c)
}

/** Rotation about +Y axis, matching the solver's move convention: U (single) = rotateY(v, -90). */
fun rotateY(v: Vec3, degrees: Float): Vec3 {
    val r = deg2rad(degrees)
    val c = cos(r)
    val s = sin(r)
    return Vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c)
}

/** Rotation about +Z axis, matching the solver's move convention: F (single) = rotateZ(v, -90). */
fun rotateZ(v: Vec3, degrees: Float): Vec3 {
    val r = deg2rad(degrees)
    val c = cos(r)
    val s = sin(r)
    return Vec3(v.x * c - v.y * s, v.x * s + v.y * c, v.z)
}

enum class Axis { X, Y, Z }

fun rotateAxis(v: Vec3, axis: Axis, degrees: Float): Vec3 = when (axis) {
    Axis.X -> rotateX(v, degrees)
    Axis.Y -> rotateY(v, degrees)
    Axis.Z -> rotateZ(v, degrees)
}

/** A fixed isometric-style camera: yaw around Y then a downward pitch around X. */
class Camera(private val yawDeg: Float = -35f, private val pitchDeg: Float = 22f) {
    fun toViewSpace(v: Vec3): Vec3 = rotateX(rotateY(v, yawDeg), pitchDeg)
}
