# How to Obtain an APK from Your Expo Project

You've received an `.aab` (Android App Bundle) file because it's the modern, official format for publishing apps to the Google Play Store. EAS Build correctly defaults to creating an `.aab` for release builds. This document outlines two methods to get an APK.

## Method 1: Configure EAS to Build an APK (Recommended for Future Builds)

This is the recommended approach for getting an APK for testing or direct distribution, as it simplifies the process for all subsequent builds.

1.  **Edit your `eas.json` file.**
2.  Find your Android build profile (it's likely named `"production"` or `"preview"`).
3.  Add the line `"buildType": "apk"` to this profile.

    Your `eas.json` should look something like this (example for the `"production"` profile):

    ```json
    {
      "cli": {
        "version": ">= 7.6.0"
      },
      "build": {
        "development": {
          "developmentClient": true,
          "distribution": "internal"
        },
        "preview": {
          "distribution": "internal"
        },
        "production": {
          "android": {
            "buildType": "apk"
          }
        }
      },
      "submit": {
        "production": {}
      }
    }
    ```

4.  **Run the build again.** Make sure to specify the profile you modified (e.g., `production`):

    ```bash
    eas build --platform android --profile production
    ```

    Now, EAS will generate and provide a direct download link to an `.apk` file instead of an `.aab`.

## Method 2: Convert an Existing `.aab` to an APK (Using `bundletool`)

If you want to convert an `.aab` file you've already downloaded, you need to use Google's official command-line tool called `bundletool`.

1.  **Download `bundletool`:**
    *   Go to the `bundletool` GitHub releases page: [https://github.com/google/bundletool/releases](https://github.com/google/bundletool/releases)
    *   Download the latest `bundletool-all-<version>.jar` file (e.g., `bundletool-all-1.15.6.jar`).

2.  **Run the Conversion Command:**
    *   Open your terminal and navigate to where you downloaded `bundletool`.
    *   Run the following command, replacing the file paths with your actual paths:

    ```bash
    java -jar bundletool-all-1.15.6.jar build-apks --bundle=/path/to/your/app.aab --output=/path/to/your/app.apks --mode=universal
    ```
    *   `--bundle`: The path to your downloaded `.aab` file.
    *   `--output`: The path where you want to save the output. Note the extension is `.apks` (plural).
    *   `--mode=universal`: This tells `bundletool` to create a single, fat APK that works on most devices.

3.  **Extract the APK:**
    *   The command will generate a file with an `.apks` extension. This is actually a ZIP archive.
    *   Rename the file from `app.apks` to `app.zip` (or whatever your output file was named).
    *   Unzip the file. Inside, you will find `universal.apk`. This is the file you can install on your Android device.
