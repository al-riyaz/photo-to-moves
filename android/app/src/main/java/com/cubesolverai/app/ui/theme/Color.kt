package com.cubesolverai.app.ui.theme

import androidx.compose.ui.graphics.Color

// App chrome accent (not literal cube sticker colors - those are reserved for cube UI only)
val CubeAccent = Color(0xFFC62839)
val CubeAccentDark = Color(0xFF7A0A1A)

val BackgroundLight = Color(0xFFFAFAFA)
val BackgroundDark = Color(0xFF14161B)
val SurfaceDark = Color(0xFF1E2128)

// Literal sticker colors, used only for cube-related UI (grid, stickers, move chips).
// Matches the web app's CSS custom properties exactly (src/index.css --cube-*, HSL->RGB):
// white 0 0% 98%, red 0 85% 35%, green 140 65% 45%, yellow 51 100% 50%, orange 30 100% 65%, blue 220 85% 55%.
object StickerColors {
    val U = Color(0xFFFAFAFA) // White
    val R = Color(0xFFA50D0D) // Red
    val F = Color(0xFF28BD5A) // Green
    val D = Color(0xFFFFD900) // Yellow
    val L = Color(0xFFFFA64D) // Orange
    val B = Color(0xFF2B6CEE) // Blue
}
