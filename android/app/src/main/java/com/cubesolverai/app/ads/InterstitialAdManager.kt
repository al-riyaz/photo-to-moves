package com.cubesolverai.app.ads

import android.app.Activity
import android.content.Context
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback
import com.google.android.libraries.ads.mobile.sdk.common.AdRequest
import com.google.android.libraries.ads.mobile.sdk.common.FullScreenContentError
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError
import com.google.android.libraries.ads.mobile.sdk.interstitial.InterstitialAd
import com.google.android.libraries.ads.mobile.sdk.interstitial.InterstitialAdEventCallback

/**
 * Preloads a single interstitial and shows it at most once per app session, at the
 * Solve -> Solution transition. Never shown over the camera UI or mid color-correction.
 */
object InterstitialAdManager {
    private var ad: InterstitialAd? = null
    private var isLoading = false
    private var shownThisSession = false

    fun preload(context: Context) {
        if (!AdsInitializer.canRequestAds || ad != null || isLoading || shownThisSession) return
        isLoading = true
        InterstitialAd.load(
            AdRequest.Builder(AdConfig.interstitialUnitId).build(),
            object : AdLoadCallback<InterstitialAd> {
                override fun onAdLoaded(ad: InterstitialAd) {
                    this@InterstitialAdManager.ad = ad
                    isLoading = false
                }

                override fun onAdFailedToLoad(adError: LoadAdError) {
                    isLoading = false
                }
            },
        )
    }

    /** Shows the preloaded interstitial if available and not already shown this session, then calls [onDismissed] either way. */
    fun maybeShow(activity: Activity, onDismissed: () -> Unit) {
        val current = ad
        if (shownThisSession || current == null) {
            onDismissed()
            return
        }
        current.adEventCallback = object : InterstitialAdEventCallback {
            override fun onAdDismissedFullScreenContent() {
                ad = null
                shownThisSession = true
                onDismissed()
            }

            override fun onAdFailedToShowFullScreenContent(fullScreenContentError: FullScreenContentError) {
                ad = null
                shownThisSession = true
                onDismissed()
            }
        }
        current.show(activity)
    }
}
