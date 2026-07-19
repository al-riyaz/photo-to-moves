# CubeSolver AI — Android

A native Kotlin + Jetpack Compose Android app: scan a physical Rubik's Cube's 6 faces with the
rear camera, confirm/correct the detected sticker colors, and get an interactive, animated
step-by-step solution. This is a self-contained addition to the repo — it does not share code
with the web app (`src/`) at the root, though it ports the same proven logic (facelet
convention, color-classification thresholds, the Kociemba two-phase solver) so behavior matches.

## Project layout

```
android/
├── app/       Compose UI: camera capture, color grid, animated 3D solution view, ads, navigation
└── solver/    Pure-Kotlin/JVM module (no Android deps) - the ported cube-solving algorithm
```

Open this `android/` folder directly in Android Studio (not the repo root).

## Important: don't run `npx cap add android`

The repo root has a `capacitor.config.json` left over from the web app's Capacitor setup, but
no Capacitor Android project has ever been generated. **This native project is the real Android
target.** Running `npx cap add android` from the repo root would try to scaffold Capacitor's own
generated project into this same `android/` folder and could clobber it. If the web app's
Capacitor target is ever needed, generate it into a different folder, e.g.
`npx cap add android --directory=capacitor-android`.

## Build

```bash
cd android
./gradlew :app:assembleDebug        # debug APK
./gradlew :solver:test :app:testDebugUnitTest   # unit tests (no emulator needed)
```

You'll need `sdk.dir` set in `android/local.properties` (gitignored) pointing at your Android
SDK, and a JDK 17+ on `JAVA_HOME` (Android Studio bundles one under
`<Android Studio install dir>/jbr`).

## A note on the Gradle/Kotlin setup

AGP 9.0+ introduced a new "built-in Kotlin" model that drops the `org.jetbrains.kotlin.android`
/ `org.jetbrains.kotlin.plugin.compose` Gradle plugins in favor of Kotlin support built directly
into AGP. This project **opts out** of that (via `android.builtInKotlin=false` and
`android.newDsl=false` in `gradle.properties`) and keeps the traditional, thoroughly documented
explicit-plugin setup, since the new model is only weeks old as of this writing and its
tooling/community knowledge is still thin. That opt-out is available until AGP 10.0 — revisit
this once the new model has matured and has broader documentation/tooling support.

## Solver licensing

The cube-solving algorithm in `:solver` is a Kotlin port of [cube.js](https://github.com/ldez/cubejs)
(MIT licensed) rather than a vendored copy of `min2phase` — see
[`THIRD_PARTY_LICENSES.md`](./THIRD_PARTY_LICENSES.md) for why, and attribution.

## Shipping to the Play Store

See [`RELEASE_GUIDE.md`](./RELEASE_GUIDE.md) for the full checklist: Play Console + AdMob
account setup, signing, store listing assets, the mandatory closed-testing track, and how to
swap in real AdMob ad unit IDs before release (currently `android/app/.../ads/AdConfig.kt` uses
Google's public test IDs).

## What's not yet done / verify before shipping

- **Not run on a real device or emulator** during development — only build/unit-test verified.
  Open in Android Studio and run through the full camera → color-correction → solve flow before
  trusting it.
- No drag-to-orbit camera on the 3D solution view yet (fixed isometric angle only).
- App icon (`res/drawable/ic_launcher_*.xml`) is a simple placeholder glyph, not final art.
- AdMob ad unit IDs are Google's test IDs — must be swapped for real ones before release
  (see `RELEASE_GUIDE.md`).
