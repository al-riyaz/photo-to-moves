plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.jvm) apply false
}

// This project lives under a OneDrive-synced folder. OneDrive's sync agent briefly locks
// files inside build/ output right after they're written, which races with Gradle's
// clean-before-rebuild step and intermittently fails with "Unable to delete directory".
// Keeping build output outside the synced tree avoids that entirely.
val externalBuildRoot = File(System.getenv("LOCALAPPDATA") ?: System.getProperty("user.home"), "CubeSolverAIBuild")
allprojects {
    layout.buildDirectory.set(File(externalBuildRoot, project.name))
}
