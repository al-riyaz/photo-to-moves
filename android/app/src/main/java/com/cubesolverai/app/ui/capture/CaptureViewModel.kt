package com.cubesolverai.app.ui.capture

import android.graphics.Bitmap
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.cubesolverai.app.colorutils.RGB
import com.cubesolverai.app.colorutils.classifyStickerColor
import com.cubesolverai.app.colorutils.rotateGrid
import com.cubesolverai.app.colorutils.sample3x3Averages
import com.cubesolverai.app.model.CAPTURE_ORDER
import com.cubesolverai.app.model.CubeFace
import com.cubesolverai.app.model.FACELET_ORDER

data class FaceCaptureState(
    val bitmap: Bitmap? = null,
    val rgbGrid: List<RGB> = emptyList(),
    val labels: List<CubeFace?> = List(9) { null },
) {
    val isCaptured: Boolean get() = bitmap != null
    val isFullyLabeled: Boolean get() = labels.all { it != null }
}

/** Owns the 6-face capture + color-correction flow, from photo to a validated facelet string. */
class CaptureViewModel : ViewModel() {
    var faces by mutableStateOf(CAPTURE_ORDER.associate { it.face to FaceCaptureState() })
        private set

    var currentIndex by mutableStateOf(0)
        private set

    val currentFace: CubeFace get() = CAPTURE_ORDER[currentIndex].face
    val isLastFace: Boolean get() = currentIndex == CAPTURE_ORDER.lastIndex
    val allFacesCaptured: Boolean get() = faces.values.all { it.isCaptured }
    val allFacesLabeled: Boolean get() = faces.values.all { it.isFullyLabeled }

    fun onPhotoCaptured(face: CubeFace, bitmap: Bitmap) {
        val rgbGrid = sample3x3Averages(bitmap)
        val labels = rgbGrid.map { classifyStickerColor(it) }
        faces = faces + (face to FaceCaptureState(bitmap, rgbGrid, labels))
    }

    fun retake(face: CubeFace) {
        faces = faces + (face to FaceCaptureState())
    }

    fun goToNextFace() {
        if (currentIndex < CAPTURE_ORDER.lastIndex) currentIndex++
    }

    fun goToFace(face: CubeFace) {
        val idx = CAPTURE_ORDER.indexOfFirst { it.face == face }
        if (idx >= 0) currentIndex = idx
    }

    fun updateLabel(face: CubeFace, cellIndex: Int, newLabel: CubeFace) {
        val state = faces[face] ?: return
        val newLabels = state.labels.toMutableList().apply { this[cellIndex] = newLabel }
        faces = faces + (face to state.copy(labels = newLabels))
    }

    fun rotateFace(face: CubeFace) {
        val state = faces[face] ?: return
        faces = faces + (
            face to state.copy(
                rgbGrid = rotateGrid(state.rgbGrid, 1),
                labels = rotateGrid(state.labels, 1),
            )
            )
    }

    /** Mirrors the web app's validateFaceletCounts. Returns an error message, or null if valid. */
    fun validationError(): String? {
        if (!allFacesLabeled) return "Finish assigning colors on every face first."
        val counts = CubeFace.entries.associateWith { 0 }.toMutableMap()
        for (face in FACELET_ORDER) {
            val labels = faces.getValue(face).labels
            for (label in labels) counts[label!!] = counts.getValue(label) + 1
        }
        val problems = counts.filterValues { it != 9 }
        if (problems.isNotEmpty()) {
            val detail = problems.entries.joinToString(", ") { "${it.key.letter}=${it.value}" }
            return "Each color must appear exactly 9 times: $detail"
        }
        return null
    }

    /** Builds the 54-char facelet string in U,R,F,D,L,B order (matches buildFaceletsString). */
    fun buildFaceletString(): String? {
        if (validationError() != null) return null
        return FACELET_ORDER.joinToString("") { face ->
            faces.getValue(face).labels.joinToString("") { it!!.letter.toString() }
        }
    }
}
