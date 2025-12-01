# Building the Solroof Creds Project as an APK

This project is built with Expo, allowing you to create an APK without installing Android Studio by using Expo Application Services (EAS) Build.

## Detailed Instructions

### 1. Install the EAS CLI

First, you need to install the Expo Application Services (EAS) command-line interface. Open your terminal and run this command:

```bash
npm install -g eas-cli
```

### 2. Log in to your Expo Account

If you don't have an Expo account, create one at [expo.dev/signup](https://expo.dev/signup). Then, log in to your account through the terminal:

```bash
eas login
```

It will prompt you for your Expo username and password.

### 3. Configure the Project for EAS Build

Next, you need to create a configuration file for the build. EAS can do this for you automatically. In your project directory, run:

```bash
eas build:configure
```

This will create a file named `eas.json` in your project. This file tells EAS how to build your app. For generating a basic APK, the default configuration is usually sufficient.

### 4. Start the Build

Now you are ready to start the build process. Run the following command to build for Android:

```bash
eas build --platform android
```

This command will:
1.  Check for any required setup and prompt you to resolve it (like creating an an Android package name in `app.json` if it's missing).
2.  Upload your project files to the EAS build servers.
3.  Queue a build job. The actual build happens on Expo's servers, not on your computer.
4.  You will see a link in your terminal to monitor the build progress in your web browser.

### 5. Download the APK

Once the build is finished (it can take several minutes), the build page will provide a "Download" button. You can also copy the link from the build details page. The downloaded file will be your APK, ready to be installed on an Android device.
