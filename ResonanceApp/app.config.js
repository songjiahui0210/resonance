module.exports = {
  expo: {
    name: "Resonance",
    slug: "resonance",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      imageWidth: 200
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.resonance.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      eas: {
        projectId: "0a0a59f4-4414-4fa6-9f8f-5141e160a34a"
      }
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://resonance.app",
          root: "app"
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
}; 