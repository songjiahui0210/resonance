# Résonance

Welcome to **Résonance**, an AI-powered assistant designed to help users express their emotions more precisely, authentically, and effectively.

---

## 📖 About Résonance

### 🎙 What is Résonance?

Résonance is an **Emotion AI assistant** that helps users articulate their emotions in a way that truly reflects their inner thoughts and feelings. Whether you’re struggling to find the right words or want to improve your emotional communication, Résonance provides AI-driven guidance to enhance the clarity, depth, and nuance of your expressions.

### ✨ Key Features

✅ **Emotion Analysis** 🧠 – Detects and interprets your emotional state based on text input.

✅ **Expressive Suggestions** 💡 – Provides alternative phrasings to better convey what you feel.

✅ **Context-Aware Refinement** 🔍 – Adjusts your expression to suit different social or professional contexts.

✅ **Emotion Logs & Insights** 📊 – Tracks your emotional trends over time and offers self-awareness insights.

With **Résonance**, your emotions find their true voice.

---

## 🚀 Getting Started

### 📌 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Recommended: Latest LTS version)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A mobile device with **Expo Go** installed or an Android/iOS emulator

If you don’t have Expo installed, run:

```bash
npm install -g expo-cli
```

### 📌 2. Clone the Repository and Install Dependencies:

Clone the repository and install dependencies:

```bash
git clone https://github.com/songjiahui0210/resonance.git
cd resonance
npm install
```

Additionally, install axios for making API requests:

```bash
npm install axios
```

### 📌 **3. Set Up API Key**  

The app requires a **Gemini API Key** to function. Follow these steps:

1. **Obtain an API key** from [Google AI Studio](https://aistudio.google.com/)  
2. **Create a `.env` file** in the root directory and add the following:

   ```env
   GEMINI_API_KEY=your_api_key_here
    ```
 3. Modify index.tsx to load the API key dynamically


### 📌 **4. Start the App**

Launch the app with:

```bash
npx expo start
```

This command will start the development server. You’ll have options to run the app in:

- [A development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [An Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [An iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a lightweight environment for testing Expo apps

