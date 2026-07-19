package com.cubesolverai.app.ads

import com.cubesolverai.app.BuildConfig

/**
 * Ad unit IDs. Debug builds always use Google's public test IDs (safe to click without
 * violating AdMob policy). Release builds use the real IDs below - replace these with your
 * own AdMob app/ad-unit IDs before publishing (see android/RELEASE_GUIDE.md).
 */
object AdConfig {
    // Google's published test IDs: https://developers.google.com/admob/android/test-ads
    private const val TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713"
    private const val TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/9214589741"
    private const val TEST_INTERSTITIAL_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"

    // TODO before release: replace with your real AdMob App ID and ad unit IDs.
    private const val RELEASE_APP_ID = "ca-app-pub-0000000000000000~0000000000"
    private const val RELEASE_BANNER_UNIT_ID = "ca-app-pub-0000000000000000/0000000000"
    private const val RELEASE_INTERSTITIAL_UNIT_ID = "ca-app-pub-0000000000000000/0000000000"

    val appId: String get() = if (BuildConfig.DEBUG) TEST_APP_ID else RELEASE_APP_ID
    val bannerUnitId: String get() = if (BuildConfig.DEBUG) TEST_BANNER_UNIT_ID else RELEASE_BANNER_UNIT_ID
    val interstitialUnitId: String get() = if (BuildConfig.DEBUG) TEST_INTERSTITIAL_UNIT_ID else RELEASE_INTERSTITIAL_UNIT_ID
}
