# CubeSolver AI — Android Release Guide

A practical, step-by-step checklist for taking this app from source code to a live Play Store
listing. Follow it roughly in order — some steps (account verification, the closed-test track)
have multi-day waiting periods, so start those early even if the app itself isn't finished.

## 1. Google Play Developer account

1. Go to [play.google.com/console/signup](https://play.google.com/console/signup) and sign up
   with the Google account you want to own this app long-term (can't easily be transferred later).
2. Pay the one-time **$25 USD** registration fee.
3. Complete identity verification. Google has tightened this in recent years — it can take
   **several days**, sometimes longer if documents are unclear. Start this immediately, in
   parallel with finishing the app.
4. **Important — new-account testing requirement**: personal developer accounts created after
   Nov 13, 2023 must run a **closed test with at least 12 opted-in testers for at least 14
   continuous days** before Google grants production (public) access. This is a hard calendar
   floor independent of how finished the app is — see step 7. Recruit testers early (friends,
   family, r/Cubers or r/androidapps beta-testing exchange threads).

## 2. AdMob account

1. Go to [admob.google.com](https://admob.google.com) and sign up (can use the same Google
   account as Play Console, or a different one — either is fine, they're linked later).
2. Add a new app in AdMob: choose **Android**, "No" when asked if it's published on Play yet
   (you'll link it later once published), name it "CubeSolver AI".
3. Create two ad units under that app:
   - A **Banner** ad unit (used on the Home and color-review screens).
   - An **Interstitial** ad unit (shown once per session, right before the solution reveals).
4. Copy the **App ID** (format `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`) and the two **ad unit
   IDs** (format `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`).
5. Update `android/app/src/main/java/com/cubesolverai/app/ads/AdConfig.kt`:
   replace `RELEASE_APP_ID`, `RELEASE_BANNER_UNIT_ID`, `RELEASE_INTERSTITIAL_UNIT_ID` with your
   real values. **Leave the `TEST_*` constants alone** — they're Google's public test IDs and
   debug builds should always use them.
6. Update `android/app/build.gradle.kts` — in the `release` build type, replace the
   `manifestPlaceholders["admobAppId"]` placeholder value with your real App ID too (it has to
   be in the manifest *and* in `AdConfig.kt`).
7. **Never publish a release build with test ad IDs, and never test-click ads in a release
   build with real IDs** — both are AdMob policy violations that can get your account suspended.

## 3. Signing the app

Play apps must be cryptographically signed. This project uses **Play App Signing** (Google
manages your final signing key; you manage an "upload key" used to authenticate your builds).

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**, then
   "Create new..." to generate an upload keystore. Store the `.jks` file somewhere safe
   **outside this repo** (it's already gitignored via `android/.gitignore` — never commit it).
2. Record the keystore path, store password, key alias, and key password somewhere secure
   (a password manager). Losing these means you can't ship updates to the same app listing.
3. Create `android/keystore.properties` (gitignored, not committed) with:
   ```properties
   storeFile=/absolute/path/to/your/upload-keystore.jks
   storePassword=...
   keyAlias=...
   keyPassword=...
   ```
4. Add a `signingConfigs` block to `android/app/build.gradle.kts` that reads from this file
   and apply it to the `release` build type (Android Studio's wizard can do this for you
   automatically in step 1).
5. The first time you upload a build, Play Console will prompt you to enroll in Play App
   Signing — accept it. Google then re-signs your app with its own key for distribution; your
   upload key just proves the update really came from you.

## 4. Building the release artifact

```bash
cd android
./gradlew :app:bundleRelease
```
This produces `android/app/build/outputs/bundle/release/app-release.aab` — an Android App
Bundle, which is what Play Console expects (not a raw APK).

## 5. Store listing assets

- **App icon**: 512×512 PNG. The in-app adaptive icon (`res/drawable/ic_launcher_*.xml`) is a
  placeholder — commission or design a polished version before launch; a strong icon has an
  outsized effect on download rate.
- **Feature graphic**: 1024×500 PNG/JPG, shown at the top of the store listing.
- **Phone screenshots**: minimum 2, but use 4–6. Prioritize showing the camera-scan guide, the
  color-correction grid, and the animated solution screen — those are what differentiate this
  app from a plain scrambler/timer app.
- **Short description** (≤80 characters) and **full description** (≤4000 characters). Include
  natural keywords like "Rubik's cube solver", "camera scan", "step by step solution" for
  App Store Optimization (ASO), but write for humans first.
- **Category**: Puzzle (under Games) or Tools — Puzzle tends to fit the "solve my cube" framing
  better for discovery.

## 6. Privacy policy

Required by both Play Console (any app with a camera permission or ads) and AdMob's own
program policies. This app is designed with the property that **photos never leave the
device** — all color sampling and solving happen on-device — which makes for a simple,
honest policy. If you followed the recommendation from setup, this lives at `/privacy` on
the existing web app (`src/pages/Privacy.tsx` or similar) — deploy that page and use its
public URL in the Play Console listing and in the AdMob "Add privacy policy URL" field.

State plainly: (1) camera access is used only to photograph your cube locally, images are
never uploaded or stored remotely; (2) the AdMob/UMP SDKs collect an advertising ID and
usage data for ad personalization, governed by Google's own privacy policy; (3) no accounts,
no personal data collection beyond what's needed for ads.

## 7. Data Safety form (Play Console)

Under App content → Data safety, declare:
- **Camera**: collected but not shared, used only for app functionality, not stored off-device.
- **Advertising ID / Device or other identifiers**: collected, shared with the ad
  SDK/mediation partners, used for advertising and analytics — check the current GMA
  Next-Gen SDK's own data-disclosure documentation for the exact wording it expects, since ad
  SDK data collection specifics can change between SDK versions.

## 8. Content rating questionnaire

Straightforward for this app: no user-generated content, no violence, no user communication
features. Answer honestly; it should land in the lowest/all-ages rating tier.

## 9. Closed testing track (mandatory, see step 1.4)

1. In Play Console, create a **Closed testing** release track, upload the AAB.
2. Add at least 12 tester email addresses (a Google Group or email list works).
3. Share the opt-in URL Play Console generates; testers must install and open the app at
   least once.
4. Let it run for **14 continuous days minimum**. Google's stated most common rejection
   reason is low tester *engagement*, not just headcount — encourage testers to actually run
   through the camera-scan-to-solve flow, and respond to any feedback they leave.
5. Only after this period (and once you're satisfied with tester feedback) apply for
   **Production access** from the same screen.

## 10. Submitting for review

1. Create a **Production** release, upload the same (or updated) AAB.
2. Fill in the release notes.
3. Submit for review. Initial review is typically a few days; budget for at least one
   rejection-and-resubmit cycle, which is normal even for policy-compliant apps.

## 11. Post-launch

- Link the AdMob app to the now-published Play listing (AdMob prompts for this once it can
  find the app by package name `com.cubesolverai.app`).
- Watch the Data Safety and ads behavior for the first few days — confirm real ads (not test
  ads) are actually serving, and that the interstitial frequency cap feels right in practice.
- Keep an eye on crash reports (Play Console → Quality → Android vitals) for the first week.
