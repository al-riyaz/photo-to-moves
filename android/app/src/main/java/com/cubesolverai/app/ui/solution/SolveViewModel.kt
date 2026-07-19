package com.cubesolverai.app.ui.solution

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cubesolverai.solver.SolverAdapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed interface SolveUiState {
    data object Loading : SolveUiState
    data class AlreadySolved(val unused: Unit = Unit) : SolveUiState
    data class Solved(val moves: List<String>, val currentIndex: Int) : SolveUiState
    data class Failed(val message: String) : SolveUiState
}

class SolveViewModel : ViewModel() {
    var uiState by mutableStateOf<SolveUiState>(SolveUiState.Loading)
        private set

    fun solve(facelets: String) {
        uiState = SolveUiState.Loading
        viewModelScope.launch {
            val result = withContext(Dispatchers.Default) {
                if (!SolverAdapter.isInitialized) SolverAdapter.initialize()
                SolverAdapter.solve(facelets)
            }
            uiState = result.fold(
                onSuccess = { solution ->
                    if (solution.isBlank()) {
                        SolveUiState.AlreadySolved()
                    } else {
                        SolveUiState.Solved(moves = solution.trim().split(' '), currentIndex = 0)
                    }
                },
                onFailure = { e -> SolveUiState.Failed(e.message ?: "Something went wrong.") },
            )
        }
    }

    fun stepNext() {
        val s = uiState as? SolveUiState.Solved ?: return
        if (s.currentIndex < s.moves.size) uiState = s.copy(currentIndex = s.currentIndex + 1)
    }

    fun stepPrev() {
        val s = uiState as? SolveUiState.Solved ?: return
        if (s.currentIndex > 0) uiState = s.copy(currentIndex = s.currentIndex - 1)
    }
}
