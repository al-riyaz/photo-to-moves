package com.cubesolverai.app.ui.colorgrid

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cubesolverai.app.model.CubeFace
import com.cubesolverai.app.ui.theme.StickerColors

fun stickerColor(face: CubeFace?): Color = when (face) {
    CubeFace.U -> StickerColors.U
    CubeFace.R -> StickerColors.R
    CubeFace.F -> StickerColors.F
    CubeFace.D -> StickerColors.D
    CubeFace.L -> StickerColors.L
    CubeFace.B -> StickerColors.B
    null -> Color.LightGray
}

/** Tap-to-cycle 3x3 sticker grid for one face - mirrors the web app's CubeColorGrid.tsx. */
@Composable
fun CubeColorGridCard(
    title: String,
    letter: Char,
    labels: List<CubeFace?>,
    onCellTap: (index: Int) -> Unit,
    onRotate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(modifier = modifier, colors = CardDefaults.cardColors()) {
        Column(Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("$title ($letter)", fontWeight = FontWeight.Medium, style = MaterialTheme.typography.bodyLarge)
                IconButton(onClick = onRotate) {
                    Icon(Icons.Default.Refresh, contentDescription = "Rotate $title")
                }
            }
            Column(Modifier.padding(top = 8.dp)) {
                for (row in 0..2) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.fillMaxWidth()) {
                        for (col in 0..2) {
                            val index = row * 3 + col
                            StickerCell(
                                face = labels[index],
                                onClick = { onCellTap(index) },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                    if (row < 2) androidx.compose.foundation.layout.Spacer(Modifier.size(4.dp))
                }
            }
        }
    }
}

@Composable
private fun StickerCell(face: CubeFace?, onClick: () -> Unit, modifier: Modifier = Modifier) {
    androidx.compose.foundation.layout.Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(4.dp))
            .background(stickerColor(face))
            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(4.dp))
            .clickable(onClick = onClick),
    )
}
