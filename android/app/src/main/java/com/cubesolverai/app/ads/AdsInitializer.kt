package com.cubesolverai.app.ads

import android.app.Activity
import com.google.android.libraries.ads.mobile.sdk.MobileAds
import com.google.android.libraries.ads.mobile.sdk.initialization.InitializationConfig
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.coroutines.resume
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext

/**
 * Runs the mandatory UMP consent flow (a no-op outside the EEA/UK/Switzerland, but required
 * to attempt globally) before initializing the GMA Next-Gen SDK. Ads are only requested once
 * [ConsentInformation.canRequestAds] is true.
 */
object AdsInitializer {
    private val initialized = AtomicBoolean(false)
    private val adsAllowed = AtomicBoolean(false)

    val canRequestAds: Boolean get() = adsAllowed.get()

    suspend fun ensureInitialized(activity: Activity) {
        if (initialized.get()) return

        val consentInformation = withContext(Dispatchers.Main.immediate) {
            requestConsent(activity)
        }

        adsAllowed.set(consentInformation.canRequestAds())

        if (adsAllowed.get() && initialized.compareAndSet(false, true)) {
            withContext(Dispatchers.IO) {
                MobileAds.initialize(
                    activity.applicationContext,
                    InitializationConfig.Builder(AdConfig.appId).build(),
                )
            }
        }
    }

    private suspend fun requestConsent(activity: Activity): ConsentInformation =
        suspendCancellableCoroutine { cont ->
            val consentInformation = UserMessagingPlatform.getConsentInformation(activity)
            val params = ConsentRequestParameters.Builder().build()
            consentInformation.requestConsentInfoUpdate(
                activity,
                params,
                {
                    UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) {
                        if (cont.isActive) cont.resume(consentInformation)
                    }
                },
                {
                    // Consent info update failed (e.g. no network) - proceed without blocking
                    // the app; ads simply won't be requested until it succeeds on a later launch.
                    if (cont.isActive) cont.resume(consentInformation)
                },
            )
        }
}
