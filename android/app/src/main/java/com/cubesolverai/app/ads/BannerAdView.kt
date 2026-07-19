package com.cubesolverai.app.ads

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.libraries.ads.mobile.sdk.MobileAds
import com.google.android.libraries.ads.mobile.sdk.banner.AdSize
import com.google.android.libraries.ads.mobile.sdk.banner.AdView
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAd
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAdRequest
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError

/**
 * An adaptive banner. Only ever placed on the Home / color-review screens - never over the
 * camera viewfinder or shutter button.
 */
@Composable
fun BannerAdView(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val activity = context.findActivity() ?: return
    if (!AdsInitializer.canRequestAds || !MobileAds.isInitialized) return

    val screenWidthDp = LocalConfiguration.current.screenWidthDp

    AndroidView(
        modifier = modifier.fillMaxWidth().wrapContentHeight(),
        factory = {
            AdView(activity).apply {
                val adSize = AdSize.getLargeAnchoredAdaptiveBannerAdSize(activity, screenWidthDp)
                val request = BannerAdRequest.Builder(AdConfig.bannerUnitId, adSize).build()
                loadAd(
                    request,
                    object : AdLoadCallback<BannerAd> {
                        override fun onAdLoaded(ad: BannerAd) {}
                        override fun onAdFailedToLoad(adError: LoadAdError) {}
                    },
                )
            }
        },
    )
}
