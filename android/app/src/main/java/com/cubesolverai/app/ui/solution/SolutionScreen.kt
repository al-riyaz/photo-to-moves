package com.cubesolverai.app.ui.solution

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay

@Composable
fun SolutionScreen(
    facelets: String,
    onDone: () -> Unit,
    viewModel: SolveViewModel = viewModel(),
) {
    LaunchedEffect(facelets) { viewModel.solve(facelets) }

    when (val state = viewModel.uiState) {
        is SolveUiState.Loading -> LoadingContent()
        is SolveUiState.AlreadySolved -> AlreadySolvedContent(onDone)
        is SolveUiState.Failed -> FailedContent(state.message, onRetry = { viewModel.solve(facelets) })
        is SolveUiState.Solved -> SolvedContent(
            facelets = facelets,
            moves = state.moves,
            currentIndex = state.currentIndex,
            onPrev = viewModel::stepPrev,
            onNext = viewModel::stepNext,
            onDone = onDone,
        )
    }
}

@Composable
private fun LoadingContent() {
    Column(
        Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator()
        Spacer(Modifier.size(16.dp))
        Text("Solving your cube...", style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun AlreadySolvedContent(onDone: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Already Solved!", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.size(16.dp))
        Text("Your cube is already in a solved state.", style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.size(24.dp))
        Button(onClick = onDone) { Text("Done") }
    }
}

@Composable
private fun FailedContent(message: String, onRetry: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Couldn't Solve", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.size(12.dp))
        Text(message, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
        Spacer(Modifier.size(24.dp))
        Button(onClick = onRetry) { Text("Try Again") }
    }
}

@Composable
private fun SolvedContent(
    facelets: String,
    moves: List<String>,
    currentIndex: Int,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onDone: () -> Unit,
) {
    var isAutoPlaying by remember { mutableStateOf(false) }
    val isFinished = currentIndex >= moves.size

    LaunchedEffect(isAutoPlaying, currentIndex) {
        if (isAutoPlaying && !isFinished) {
            delay(650)
            onNext()
        } else if (isFinished) {
            isAutoPlaying = false
        }
    }

    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Text("Step $currentIndex of ${moves.size}", style = MaterialTheme.typography.headlineMedium)

        AnimatedCubeView(
            facelets = facelets,
            moves = moves,
            currentIndex = currentIndex,
            modifier = Modifier.padding(vertical = 12.dp),
        )

        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            moves.forEachIndexed { index, move ->
                val isCurrent = index == currentIndex
                Surface(
                    color = if (isCurrent) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(8.dp),
                ) {
                    Text(
                        move,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        fontFamily = FontFamily.Monospace,
                        fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                        color = if (isCurrent) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedButton(onClick = onPrev, enabled = currentIndex > 0, modifier = Modifier.weight(1f)) {
                Text("Prev")
            }
            FilledTonalIconButton(onClick = { isAutoPlaying = !isAutoPlaying }, enabled = !isFinished) {
                Icon(
                    if (isAutoPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isAutoPlaying) "Pause" else "Autoplay",
                )
            }
            Button(onClick = onNext, enabled = currentIndex < moves.size, modifier = Modifier.weight(1f)) {
                Text("Next")
            }
        }
        if (isFinished) {
            Button(onClick = onDone, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
                Text("Solved! Done")
            }
        }
    }
}
