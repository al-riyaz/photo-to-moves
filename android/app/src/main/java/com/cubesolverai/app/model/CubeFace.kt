package com.cubesolverai.app.model

/** U/R/F/D/L/B - matches the solver module's face letters and the web app's Face type. */
enum class CubeFace(val letter: Char) {
    U('U'), R('R'), F('F'), D('D'), L('L'), B('B');

    companion object {
        fun fromLetter(letter: Char): CubeFace? = entries.firstOrNull { it.letter == letter }

        /** Cycle order used by the tap-to-correct grid: U -> R -> F -> D -> L -> B -> U ... */
        private val CYCLE = listOf(U, R, F, D, L, B)

        fun next(current: CubeFace?): CubeFace {
            if (current == null) return CYCLE[0]
            val i = CYCLE.indexOf(current)
            return CYCLE[(i + 1) % CYCLE.size]
        }
    }
}

/** Human capture order (Top, Front, Right, Left, Back, Bottom) - matches the web app's FACE_META. */
data class FaceMeta(val face: CubeFace, val title: String, val hint: String)

val CAPTURE_ORDER: List<FaceMeta> = listOf(
    FaceMeta(CubeFace.U, "Top", "Hold the cube with its TOP face pointing at the camera."),
    FaceMeta(CubeFace.F, "Front", "Keeping the same face up, turn the cube so its FRONT faces the camera."),
    FaceMeta(CubeFace.R, "Right", "Turn the cube so its RIGHT face points at the camera."),
    FaceMeta(CubeFace.L, "Left", "Turn the cube so its LEFT face points at the camera."),
    FaceMeta(CubeFace.B, "Back", "Turn the cube so its BACK face points at the camera."),
    FaceMeta(CubeFace.D, "Bottom", "Tilt the cube so its BOTTOM face points at the camera."),
)

/** Facelet-string order (U,R,F,D,L,B) - matches the web app's buildFaceletsString / the solver. */
val FACELET_ORDER: List<CubeFace> = listOf(CubeFace.U, CubeFace.R, CubeFace.F, CubeFace.D, CubeFace.L, CubeFace.B)
