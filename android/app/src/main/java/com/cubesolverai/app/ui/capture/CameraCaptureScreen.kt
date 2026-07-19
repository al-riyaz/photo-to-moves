package com.cubesolverai.app.ui.capture

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.cubesolverai.app.R
import com.cubesolverai.app.model.CAPTURE_ORDER
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

@Composable
fun CameraCaptureScreen(
    viewModel: CaptureViewModel,
    onAllFacesCaptured: () -> Unit,
) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED,
        )
    }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    if (!hasCameraPermission) {
        CameraPermissionRationale(onRequestPermission = { permissionLauncher.launch(Manifest.permission.CAMERA) })
        return
    }

    val faceMeta = CAPTURE_ORDER[viewModel.currentIndex]
    val state = viewModel.faces.getValue(faceMeta.face)

    Column(Modifier.fillMaxSize()) {
        LinearProgressIndicator(
            progress = { (viewModel.currentIndex + 1) / CAPTURE_ORDER.size.toFloat() },
            modifier = Modifier.fillMaxWidth(),
        )
        Box(Modifier.fillMaxSize()) {
            if (state.isCaptured) {
                FaceReviewContent(
                    bitmap = state.bitmap!!,
                    faceIndex = viewModel.currentIndex,
                    faceTitle = faceMeta.title,
                    isLastFace = viewModel.isLastFace,
                    onRetake = { viewModel.retake(faceMeta.face) },
                    onConfirm = {
                        if (viewModel.isLastFace) onAllFacesCaptured() else viewModel.goToNextFace()
                    },
                )
            } else {
                CameraPreviewContent(
                    faceTitle = faceMeta.title,
                    faceHint = faceMeta.hint,
                    faceIndex = viewModel.currentIndex,
                    onCaptured = { bitmap -> viewModel.onPhotoCaptured(faceMeta.face, bitmap) },
                )
            }
        }
    }
}

@Composable
private fun CameraPermissionRationale(onRequestPermission: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(48.dp))
        Spacer(Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.camera_permission_rationale),
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRequestPermission) {
            Text(stringResource(R.string.grant_camera_permission))
        }
    }
}

@Composable
private fun CameraPreviewContent(
    faceTitle: String,
    faceHint: String,
    faceIndex: Int,
    onCaptured: (Bitmap) -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()
    val previewView = remember { PreviewView(context) }
    val imageCapture = remember { ImageCapture.Builder().build() }
    var isCapturing by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    DisposableEffect(previewView) {
        val providerFuture = ProcessCameraProvider.getInstance(context)
        providerFuture.addListener(
            {
                val cameraProvider = providerFuture.get()
                val preview = Preview.Builder().build().also { it.surfaceProvider = previewView.surfaceProvider }
                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        CameraSelector.DEFAULT_BACK_CAMERA,
                        preview,
                        imageCapture,
                    )
                } catch (e: Exception) {
                    errorMessage = "Couldn't start the camera: ${e.message}"
                }
            },
            ContextCompat.getMainExecutor(context),
        )
        onDispose {
            runCatching { ProcessCameraProvider.getInstance(context).get().unbindAll() }
        }
    }

    Box(Modifier.fillMaxSize()) {
        AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())
        CaptureGuideOverlay(modifier = Modifier.fillMaxSize())

        Surface(
            color = Color.Black.copy(alpha = 0.55f),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.align(Alignment.TopCenter).padding(top = 16.dp),
        ) {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    "Face ${faceIndex + 1} of ${CAPTURE_ORDER.size} - $faceTitle",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleLarge,
                )
                Text(faceHint, color = Color.White.copy(alpha = 0.9f), style = MaterialTheme.typography.bodyLarge)
            }
        }

        errorMessage?.let {
            Surface(color = MaterialTheme.colorScheme.errorContainer, modifier = Modifier.align(Alignment.Center).padding(24.dp)) {
                Text(it, modifier = Modifier.padding(16.dp))
            }
        }

        FloatingActionButton(
            onClick = {
                if (isCapturing) return@FloatingActionButton
                isCapturing = true
                val photoFile = File(context.cacheDir, "face_capture_${System.currentTimeMillis()}.jpg")
                val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                imageCapture.takePicture(
                    outputOptions,
                    ContextCompat.getMainExecutor(context),
                    object : ImageCapture.OnImageSavedCallback {
                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                            scope.launch {
                                val bitmap = withContext(Dispatchers.Default) {
                                    val decoded = decodeAndRotate(photoFile)
                                    photoFile.delete()
                                    decoded
                                }
                                isCapturing = false
                                onCaptured(bitmap)
                            }
                        }

                        override fun onError(exception: ImageCaptureException) {
                            isCapturing = false
                            errorMessage = "Couldn't capture photo: ${exception.message}"
                        }
                    },
                )
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp),
        ) {
            Icon(Icons.Default.Camera, contentDescription = stringResource(R.string.capture_photo))
        }
    }
}

@Composable
private fun FaceReviewContent(
    bitmap: Bitmap,
    faceIndex: Int,
    faceTitle: String,
    isLastFace: Boolean,
    onRetake: () -> Unit,
    onConfirm: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            "Face ${faceIndex + 1} of ${CAPTURE_ORDER.size} - $faceTitle",
            style = MaterialTheme.typography.titleLarge,
        )
        Spacer(Modifier.height(16.dp))
        Image(
            bitmap = bitmap.asImageBitmap(),
            contentDescription = "$faceTitle face preview",
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp)),
        )
        Spacer(Modifier.height(24.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            OutlinedButton(onClick = onRetake) { Text(stringResource(R.string.retake)) }
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
            ) {
                Text(if (isLastFace) stringResource(R.string.review_colors) else stringResource(R.string.next_face))
            }
        }
    }
}
