package com.cubesolverai.app.ui.colorgrid

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.cubesolverai.app.model.CAPTURE_ORDER
import com.cubesolverai.app.ui.capture.CaptureViewModel

@Composable
fun ColorReviewScreen(
    viewModel: CaptureViewModel,
    onSolve: (facelets: String) -> Unit,
) {
    val error = viewModel.validationError()

    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Text(
                    "Double-check each face. Tap any sticker to cycle its color, or rotate a face if it doesn't line up.",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(bottom = 4.dp),
                )
            }
            items(CAPTURE_ORDER) { meta ->
                val state = viewModel.faces.getValue(meta.face)
                CubeColorGridCard(
                    title = meta.title,
                    letter = meta.face.letter,
                    labels = state.labels,
                    onCellTap = { index ->
                        val current = state.labels[index]
                        viewModel.updateLabel(meta.face, index, com.cubesolverai.app.model.CubeFace.next(current))
                    },
                    onRotate = { viewModel.rotateFace(meta.face) },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (error != null) {
                item {
                    Surface(
                        color = MaterialTheme.colorScheme.errorContainer,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            error,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.padding(12.dp),
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            }
        }

        Surface(shadowElevation = 8.dp) {
            Button(
                onClick = { viewModel.buildFaceletString()?.let(onSolve) },
                enabled = error == null,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
            ) {
                Text("Solve My Cube", style = MaterialTheme.typography.titleLarge)
            }
        }
    }
}
