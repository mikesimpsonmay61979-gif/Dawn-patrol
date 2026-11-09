# Dawn Patrol on Google Play, with ads

Dawn Patrol is a free Progressive Web App. This note is how to ship that same site on Google Play as a Trusted Web Activity, how ads behave in that package, and what to answer in Play Console. The app has no price, no in-app purchase, and no subscription. Do not add one.

The website already has in-flow AdSense slots (`src/components/AdSlot.tsx`), `/ads.txt`, `/app-ads.txt`, and a privacy policy at `/privacy`. See the README for the environment variables. Point Bubblewrap or PWABuilder at a production HTTPS deploy. The service worker does not register during `npm run dev`.

## Wrap the PWA as a Trusted Web Activity

A Trusted Web Activity (TWA) opens your origin in Chrome, full screen, from an installed Android package. The UI stays this Next.js app. Digital Asset Links prove the package is allowed to hide the browser bar.

The manifest already uses `display: standalone`, a start URL inside the scope, and 192, 512, and maskable icons. Keep those.

### Bubblewrap

1. Deploy the site on HTTPS.
2. Install the CLI: `npm install -g @bubblewrap/cli`.
3. From an empty directory, run `bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.webmanifest`.
4. Answer the prompts with a package name you control (for example `studio.soulhealing.dawnpatrol`), the app name Dawn Patrol, the launcher name, the theme color `#0c1410`, and a signing key. Bubblewrap can generate the key. Store the key and the passwords. You cannot recover an update without them.
5. `bubblewrap build` writes an Android App Bundle (`.aab`) and an APK. Play Console wants the `.aab`.
6. `bubblewrap fingerprint` prints the SHA-256 of the signing certificate. Put that fingerprint in `/.well-known/assetlinks.json` on the same host as the PWA:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "studio.soulhealing.dawnpatrol",
      "sha256_cert_fingerprints": ["AA:BB:CC:…"]
    }
  }
]
```

Serve it as `application/json`. Confirm the URL in a browser before you upload. If the statement does not verify, the installed app shows a Chrome bar. Bubblewrap also prints a copy of this file during init. Use the fingerprint of the key you actually upload, including the Play App Signing key if Play re-signs the bundle. Play Console → App signing shows that certificate.

7. `bubblewrap update` after the manifest or the host changes, then build again.

The package id above is an example. Pick one and keep it.

### PWABuilder

1. Open [PWABuilder](https://www.pwabuilder.com/) and enter the production URL.
2. Package for Android and choose Trusted Web Activity. Do not choose a package that adds a billing library.
3. Set the package name, Dawn Patrol, the version, and the signing options. Download the `.aab`, or the Android project if you would rather build it yourself.
4. Publish `assetlinks.json` for that signing key the same way as above. PWABuilder shows the fingerprint in the Android packaging options.
5. Upload the `.aab` to Play Console.

Either tool is enough. Do not ship both packages under two package names unless you mean to.

## AdSense in the TWA, or native AdMob

### AdSense inside the TWA

The web slots load in Chrome as part of the page. One implementation covers the browser and the installed app. Cookies are Chrome cookies for your origin. `/ads.txt` on that origin is the authorization file AdSense crawls.

AdSense is a website product. A TWA is closer to the site than a generic WebView, and the units can fill after the site is approved, but AdSense policy is not written as an app SDK. Review can limit or refuse inventory it treats as an app, fill is often thinner than AdMob, and third-party cookie limits apply. The page does not read the Android advertising ID. A pure TWA package usually has no `AD_ID` permission. Say that honestly in Play Console. Do not declare a permission the package does not have.

Leave the slots in normal flow. Do not enable AdSense Auto ads, anchor ads, or vignettes. Those overlay Today and the Read. This repo never requests them.

### Native AdMob

AdMob is the SDK Google documents for Play apps. It is added in the Android project Bubblewrap or PWABuilder generated, not in this Next.js app. A banner belongs in the native layout, above or below the web view, so it cannot sit on the card, the map, or a solunar block. Do not put a second sticky web banner in the same viewport.

That path needs an approved AdMob app, the Google Mobile Ads SDK, `com.google.android.gms.permission.AD_ID` in the merged manifest, and `app-ads.txt` on the developer website. Fill and Play’s ad tooling are built for this. It is a second integration, and the banner has to be designed so it does not cover the TWA.

### Which to ship

Use AdSense for the website. That is already wired. For the Play package, prefer one native AdMob banner in the shell once the AdMob account is approved, and keep the in-page slots for the browser. If the first Play build is a TWA with the web slots only, still complete the ads declaration and the privacy policy, and match the advertising-ID answers to the package you actually uploaded. Do not stack AdSense and AdMob on the same screen.

There is no paid upgrade to remove ads. The app stays free.

## Play Console checklist

Work through App content before you send the release for review. The privacy policy URL is `https://YOUR_DOMAIN/privacy`. It must load without a login.

- **Price: Free.** Set the app and every country to Free. A free app cannot later become a paid download. Do not create an in-app product or a subscription. Free here is permanent.
- **Ads: Yes.** Policy → App content → Ads. The app contains ads, including when the web slots are the only ads. Answer Yes even while the production build is still waiting on an AdSense or AdMob approval, if the release you are submitting will show them. If you submit a build with ads compiled out and no plan to turn them on, the answer would be No. This project is meant to run with ads, so the listing answer is Yes.
- **Data safety.** Describe this app, then change the form if you add a native SDK.
  - Approximate location. Collected only after the person taps “Use my location.” Sent to Open-Meteo for the forecast. Used on the device for solunar times. Not stored. Optional. Purpose: app functionality. Shared with the weather provider for that request. Not sold.
  - Advertising ID / device or other IDs. Declare this when AdMob is in the package or when the TWA page runs AdSense. Google collects it for advertising and measurement. Soul Healing Studios does not receive a copy and does not sell it. If the uploaded package has no ads SDK and you have not set the AdSense variables, do not claim the ID is collected.
  - Photos and the harvest log stay on the device. Do not mark them collected unless a later build uploads them. There is no account, no name, and no email form. The support address is a `mailto` link.
- **Content rating.** Finish the IARC questionnaire. The app is a hunting and fishing planner: seasons, a map, weather, and a scored daily card. There is no public social feed. Answer the hunting questions the way the questionnaire asks them, and accept the rating it returns.
- **Target audience.** Do not include children. Leave Designed for Families off. This is a hunting and fishing tool, not a children’s app. Pick the age groups you actually serve.
- **Privacy policy URL.** `https://YOUR_DOMAIN/privacy`, in the store listing and in App content. The same page is linked from the About pill and from the first-launch notice. It names Google AdSense and AdMob, cookies, the advertising ID, the opt-out links, location, Soul Healing Studios, and minddriftstudio79@gmail.com.
- **AD_ID.** If the merged manifest includes `com.google.android.gms.permission.AD_ID` (the Mobile Ads SDK adds it), declare that use in Play Console and keep the permission. If you delete the permission while the SDK still reads the ID, Android 13 and later return a string of zeros and Play can flag the declaration. A TWA with no ads SDK should omit the permission and the declaration. The Play Console advertising-ID question has to match the package.
- **app-ads.txt.** AdMob crawls the developer website verified on the Play account, at `https://DEVELOPER_WEBSITE/app-ads.txt`. That host is not always the PWA host. This app serves the same body at `/ads.txt` and `/app-ads.txt`. If this domain is the developer website, set `NEXT_PUBLIC_ADSENSE_CLIENT` or `ADS_TXT` and confirm the URL in a browser. If the developer website is somewhere else, put the same lines on that site. The Google certification authority id is `f08c47fec0942fa0`. A comment-only placeholder does not authorize the app. Details: [app-ads.txt for AdMob](https://developers.google.com/admob/android/app-ads).
- **Account approval.** Create the AdSense account for the site and, if you add the SDK, an AdMob app linked to the Play package name. Ads do not fill until Google approves the account and you put the real client and unit ids in the environment, then rebuild. The production UI shows no placeholder while those are empty. Do not click your own live ads. AdMob’s test devices are for the native SDK only.
- **Listing copy.** Say the app is free and supported by ads. Link the privacy policy. Target the current Play API level shown at upload time. Meet the content policies for hunting and wildlife. Do not promise season dates or bag limits the app does not keep.

## After the first upload

Check Digital Asset Links with [Google’s statement tester](https://developers.google.com/digital-asset-links/tools/generator). Open the installed app and confirm the Read can be played with nothing covering the choices, the map still pans, and any banner sits in the page or in the native chrome around it. Then request production access if the AdMob or AdSense account is still in a limited state.
