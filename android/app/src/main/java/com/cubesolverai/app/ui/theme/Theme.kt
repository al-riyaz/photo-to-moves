package com.cubesolverai.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColors = darkColorScheme(
    primary = CubeAccent,
    secondary = CubeAccentDark,
    background = BackgroundDark,
    surface = SurfaceDark,
)

private val LightColors = lightColorScheme(
    primary = CubeAccentDark,
    secondary = CubeAccent,
    background = BackgroundLight,
    surface = BackgroundLight,
)

@Composable
fun CubeSolverTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colors,
        typography = CubeSolverTypography,
        content = content,
    )
}
