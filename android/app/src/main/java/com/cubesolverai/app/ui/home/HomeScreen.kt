package com.cubesolverai.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.layout.Spacer
import androidx.compose.ui.unit.dp
import com.cubesolverai.app.ads.BannerAdView
import com.cubesolverai.app.ui.theme.StickerColors

@Composable
fun HomeScreen(onScanCube: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            CubeGlyph()

            Spacer(Modifier.size(32.dp))

            Text(
                "CubeSolver AI",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.size(8.dp))
            Text(
                "Scan your Rubik's Cube and get a step-by-step solution in seconds.",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.size(40.dp))

            Button(
                onClick = onScanCube,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Scan My Cube", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(vertical = 6.dp))
            }
        }
        BannerAdView()
    }
}

/** Small gradient cube glyph built from the 6 literal sticker colors, echoing the app icon. */
@Composable
private fun CubeGlyph() {
    val colors = listOf(StickerColors.U, StickerColors.R, StickerColors.F, StickerColors.D, StickerColors.L, StickerColors.B)
    Box(
        modifier = Modifier
            .size(88.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Brush.linearGradient(colors)),
    )
}
