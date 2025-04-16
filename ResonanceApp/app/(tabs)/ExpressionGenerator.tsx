import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
  AccessibilityInfo,
  Modal,
  Switch
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const apiKey = Constants.expoConfig?.extra?.geminiApiKey;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in app.config.js');
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

type TagCategory = 'emotion' | 'recipient' | 'scenario' | 'purpose';

interface TagSelectionParams {
  tag: string;
  setter: (value: React.SetStateAction<string>) => void;
  customSetter: (value: React.SetStateAction<string>) => void;
  category?: TagCategory;
}

const handleTagSelection = ({
  tag,
  setter,
  customSetter,
  category = 'emotion'
}: TagSelectionParams) => {
  if (!tag) {
    console.warn(`No tag provided for ${category} selection`);
    return;
  }

  setter(tag);
  customSetter('');
};

export default function ExpressionGenerator() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  const isDarkMode = theme === 'dark';
  const [fontSize, setFontSize] = useState('medium');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);
  const [showSavedPhrases, setShowSavedPhrases] = useState(false);

  // emotion
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [showDetailedEmotions, setShowDetailedEmotions] = useState(false);

  // recipient
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');

  // scenario
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customScenario, setCustomScenario] = useState('');

  // whatHappened
  const [whatHappened, setWhatHappened] = useState('');

  // additional input
  const [lastMessage, setLastMessage] = useState('');
  type Message = { type: string; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [additionalInput, setAdditionalInput] = useState('');

  // purpose
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');

  const emotions = ['Happy 😊', 'Sad 😢', 'Angry 😡', 'Worried 😨', 'Other'];
  const detailedEmotions = ['Overwhelmed', 'Stressed', 'Anxious', 'Frustrated', 'Annoyed', 'Nervous'];
  const recipients = ['Friend', 'Family', 'Romantic interest', 'Peers', 'Other'];
  const scenarios = ['School', 'Home', 'Public places', 'Workplace', 'Online', 'Medical Settings', 'Other'];
  const purposeOptions = ['Express feelings', 'Seek help', 'Other'];

  useEffect(() => {
    const checkScreenReader = async () => {
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(screenReaderEnabled);
    };

    checkScreenReader();
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    loadSavedPhrases();

    return () => {
      subscription.remove();
    };
  }, []);

  const loadSavedPhrases = async () => {
    try {
      const savedPhrasesString = await AsyncStorage.getItem('savedPhrases');
      if (savedPhrasesString) {
        const phrases = JSON.parse(savedPhrasesString);
        setSavedPhrases(phrases);
      }
    } catch (error) {
      console.error('Error loading phrases:', error);
    }
  };

  const savePhraseToStorage = async (phrase: string) => {
    try {

      const existingPhrasesString = await AsyncStorage.getItem('savedPhrases');
      const existingPhrases = existingPhrasesString ? JSON.parse(existingPhrasesString) : [];

      if (existingPhrases.includes(phrase)) {
        Alert.alert('Already Saved', 'This phrase is already in your saved phrases.');
        return;
      }

      const updatedPhrases = [...existingPhrases, phrase];
      await AsyncStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));
      setSavedPhrases(updatedPhrases);

      Alert.alert('Success', 'Phrase saved successfully!');
    } catch (error) {
      console.error('Error saving phrase:', error);
      Alert.alert('Error', 'Failed to save phrase. Please try again.');
    }
  };



  const deletePhrase = async (index: number) => {
    try {
      const existingPhrasesString = await AsyncStorage.getItem('savedPhrases');

      if (!existingPhrasesString) {
        return;
      }

      const existingPhrases = JSON.parse(existingPhrasesString);

      const updatedPhrases = [...existingPhrases];
      updatedPhrases.splice(index, 1);

      setSavedPhrases(updatedPhrases);

      await AsyncStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));

      // Optional: Show success message
      Alert.alert('Success', 'Phrase deleted successfully!');
    } catch (error) {
      console.error('Error deleting phrase:', error);
      Alert.alert('Error', 'Failed to delete phrase. Please try again.');
    }
  };

  // Toggle font size function
  const toggleFontSize = () => {
    if (fontSize === 'small') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('large');
    else setFontSize('small');
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // Start recording audio for voice input
  async function startRecording() {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is needed to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }

  // Stop recording and process the audio
  async function stopRecording() {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Here you would normally send this recording to a speech-to-text API
        // For this example, we'll just show a placeholder message
        Alert.alert(
          'Voice Input Recorded',
          'In a production app, this recording would be sent to a speech-to-text service.'
        );

        // Simulating voice input for demo purposes
        setWhatHappened(whatHappened + " [Voice input would be processed here]");
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  const generateExpression = async () => {
    setLoading(true);
    const scenarioText = customScenario || selectedScenario;
    const emotionText = customEmotion || selectedEmotion;
    const recipientText = customRecipient || selectedRecipient;
    const purposeText = customPurpose || selectedPurpose;

    // Validate required fields
    if (!emotionText || !recipientText || !scenarioText || !purposeText) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields: emotion, recipient, location, and purpose.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      setLoading(false);
      return;
    }

    let optionalText = '';
    if (whatHappened) {
      optionalText += ` There was a situation where ${whatHappened}.`;
    }
    if (additionalInput) {
      optionalText += ` Additional information from user: ${additionalInput}`;
    }

    const prompt = {
      contents: [{
        parts: [{
          text: `The user is a young adult with language impairments and needs you to write a few sentences of expressing their feelings for them.
        
        The user is feeling "${emotionText}" at an intensity level of ${emotionIntensity} on a scale from 1 to 10, where 1 is very mild and 10 is very strong. They want to communicate with "${recipientText}" in the "${scenarioText}" context. The purpose is to: ${purposeText}. 
        ${optionalText} 
        Write a considerate and clear text for the user directly with some details to explain their true intentions and feelings with potential causes in the situation. 
        
        Start the message with 'I' and write in authentic tone. Avoid using numbers to describe the emotion intensity; instead, use descriptive language to convey the emotion strength based on the intensity level provided, combining with what happens. Write directly for them so that they can read it directly. Don't add anything in the brackets.`

        }]
      }],
      generationConfig: {
        "temperature": 0.5,
        "maxOutputTokens": 800,
        "topP": 0.8,
        "topK": 10
      }
    };

    try {
      const response = await axios.post(API_URL, prompt);
      const generatedText = response.data.candidates[0].content.parts[0].text || "I couldn't generate a response.";
      setMessages([...messages, { type: 'ai', text: generatedText }]);
      setLastMessage(generatedText);

      // If screen reader is enabled, automatically read the generated text
      if (isScreenReaderEnabled) {
        setTimeout(() => {
          speakText(generatedText);
        }, 500);
      }

    } catch (error) {
      console.error('Error generating expression:', error);
      setMessages([...messages, { type: 'ai', text: 'Error: Unable to generate a response.' }]);
      setLastMessage('');
    }
    setShowAddMore(false);
    setAdditionalInput('');
    setLoading(false);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(lastMessage);
    Alert.alert('Copied', 'Text copied to clipboard!');
  };

  // Get dynamic text style based on current settings
  const getTextStyle = (baseStyle: any) => {
    return [
      baseStyle,
      isDarkMode ? styles.textDark : styles.textLight,
      fontSize === 'small' ? styles.textSmall :
        fontSize === 'medium' ? styles.textMedium : styles.textLarge,
      isHighContrast && styles.highContrastText
    ];
  };

  // Get dynamic background style based on current settings
  const getBackgroundStyle = (baseStyle: any) => {
    return [
      baseStyle,
      isDarkMode ? styles.backgroundDark : styles.backgroundLight,
      isHighContrast && (isDarkMode ? styles.highContrastDark : styles.highContrastLight)
    ];
  };

  // Render tag with accessibility features
  const renderTag = (item: string, isSelected: boolean, onSelect: () => void, category: string) => (
    <TouchableOpacity
      style={[
        styles.tag,
        isSelected && (isDarkMode ? styles.selectedTagDark : styles.selectedTag),
        isHighContrast && (isDarkMode ? styles.highContrastTagDark : styles.highContrastTag)
      ]}
      onPress={onSelect}
      accessible={true}
      accessibilityLabel={`${item} ${category}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityHint={`Select ${item} as your ${category}`}
    >
      <Text style={[
        styles.tagText,
        isSelected && (isDarkMode ? styles.selectedTagTextDark : styles.selectedTagText),
        fontSize === 'small' ? styles.textSmall :
          fontSize === 'medium' ? styles.textMedium : styles.textLarge,
        isHighContrast && styles.highContrastText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Accessibility settings modal
  const renderAccessibilityModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAccessibilityModal}
      onRequestClose={() => setShowAccessibilityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={getBackgroundStyle(styles.modalContent)}>
          <Text style={getTextStyle(styles.modalTitle)}>Accessibility Settings</Text>

          <View style={styles.settingRow}>
            <Text style={getTextStyle(styles.settingLabel)}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              accessibilityLabel="Toggle dark mode"
              accessibilityHint="Switches between light and dark color themes"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={getTextStyle(styles.settingLabel)}>High Contrast</Text>
            <Switch
              value={isHighContrast}
              onValueChange={setIsHighContrast}
              accessibilityLabel="Toggle high contrast mode"
              accessibilityHint="Increases color contrast for better visibility"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={getTextStyle(styles.settingLabel)}>Font Size</Text>
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity
                style={[styles.fontSizeButton, fontSize === 'small' && styles.activeFontButton]}
                onPress={() => setFontSize('small')}
                accessibilityLabel="Small font size"
                accessibilityRole="button"
              >
                <Text style={getTextStyle(styles.fontSizeButtonText)}>A</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fontSizeButton, fontSize === 'medium' && styles.activeFontButton]}
                onPress={() => setFontSize('medium')}
                accessibilityLabel="Medium font size"
                accessibilityRole="button"
              >
                <Text style={getTextStyle([styles.fontSizeButtonText, { fontSize: 18 }])}>A</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fontSizeButton, fontSize === 'large' && styles.activeFontButton]}
                onPress={() => setFontSize('large')}
                accessibilityLabel="Large font size"
                accessibilityRole="button"
              >
                <Text style={getTextStyle([styles.fontSizeButtonText, { fontSize: 22 }])}>A</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAccessibilityModal(false)}
            accessibilityLabel="Close accessibility settings"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Saved phrases modal
  const renderSavedPhrasesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSavedPhrases}
      onRequestClose={() => setShowSavedPhrases(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={getBackgroundStyle(styles.modalContent)}>
          <Text style={getTextStyle(styles.modalTitle)}>Saved Phrases</Text>

          {savedPhrases.length === 0 ? (
            <Text style={getTextStyle(styles.emptyStateText)}>
              You don't have any saved phrases yet. Generate a message and save it to see it here.
            </Text>
          ) : (
            <FlatList
              data={savedPhrases}
              keyExtractor={(_, index) => `phrase-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.savedPhraseItem}>
                  <Text
                    style={getTextStyle(styles.savedPhraseText)}
                    numberOfLines={2}
                  >
                    {item}
                  </Text>
                  <View style={styles.savedPhraseActions}>
                    <TouchableOpacity
                      style={styles.savedPhraseAction}
                      onPress={() => {
                        setLastMessage(item);
                        setShowSavedPhrases(false);
                      }}
                      accessibilityLabel="Use this phrase"
                      accessibilityRole="button"
                    >
                      <FontAwesome name="check" size={16} color="#4a90e2" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.savedPhraseAction}
                      onPress={() => speakText(item)}
                      accessibilityLabel="Speak this phrase"
                      accessibilityRole="button"
                    >
                      <FontAwesome name="volume-up" size={16} color="#4a90e2" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.savedPhraseAction}
                      onPress={() => {
                        Alert.alert(
                          'Delete Phrase',
                          'Are you sure you want to delete this phrase?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deletePhrase(index) }
                          ]
                        );
                      }}
                      accessibilityLabel="Delete this phrase"
                      accessibilityRole="button"
                    >
                      <FontAwesome name="trash" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSavedPhrases(false)}
            accessibilityLabel="Close saved phrases"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={getBackgroundStyle({ flex: 1 })}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Accessibility toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowAccessibilityModal(true)}
            accessibilityLabel="Accessibility settings"
            accessibilityRole="button"
          >
            <FontAwesome name="universal-access" size={24} color={isDarkMode ? "#fff" : "#2c3e50"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowSavedPhrases(true)}
            accessibilityLabel="Saved phrases"
            accessibilityRole="button"
          >
            <FontAwesome name="bookmark" size={24} color={isDarkMode ? "#fff" : "#2c3e50"} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={getBackgroundStyle(styles.container)}
          contentContainerStyle={styles.contentContainer}
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text
            style={getTextStyle(styles.header)}
            accessibilityRole="header"
          >
            How are you feeling today?
          </Text>

          <View style={getBackgroundStyle(styles.sectionContainer)}>
            <Text style={getTextStyle(styles.sectionTitle)} accessibilityRole="header">Emotions</Text>
            <TouchableOpacity
              onPress={() => setShowDetailedEmotions(!showDetailedEmotions)}
              style={styles.iconButton}
              accessibilityLabel={showDetailedEmotions ? "Hide detailed emotions" : "Show more emotion options"}
              accessibilityRole="button"
            >
              <FontAwesome
                name={showDetailedEmotions ? "minus" : "plus"}
                size={20}
                color="#4a90e2"
              />
            </TouchableOpacity>
            <FlatList
              data={emotions}
              renderItem={({ item }) => renderTag(
                item,
                selectedEmotion === item,
                () => handleTagSelection({
                  tag: item,
                  setter: setSelectedEmotion,
                  customSetter: setCustomEmotion,
                  category: 'emotion'
                }),
                'emotion'
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
              removeClippedSubviews={false}
            />
            {showDetailedEmotions && (
              <FlatList
                data={detailedEmotions}
                renderItem={({ item }) => renderTag(
                  item,
                  selectedEmotion === item,
                  () => handleTagSelection({
                    tag: item,
                    setter: setSelectedEmotion,
                    customSetter: setCustomEmotion,
                    category: 'emotion'
                  }),
                  'emotion'
                )}
                keyExtractor={(item) => item}
                horizontal={false}
                numColumns={2}
                removeClippedSubviews={false}
              />
            )}
            {selectedEmotion === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight,
                  fontSize === 'small' ? styles.textSmall :
                    fontSize === 'medium' ? styles.textMedium : styles.textLarge
                ]}
                placeholder="Type your emotion"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                value={customEmotion}
                onChangeText={setCustomEmotion}
                accessibilityLabel="Custom emotion input"
                accessibilityRole="text"
                accessibilityHint="Enter your own emotion if it's not in the list"
              />
            )}
            {(selectedEmotion !== '' || customEmotion) && (
              <>
                <Text
                  style={getTextStyle(styles.sliderLabel)}
                  accessibilityRole="text"
                >
                  Level: {emotionIntensity}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={emotionIntensity}
                  onValueChange={(value) => setEmotionIntensity(value)}
                  minimumTrackTintColor="#4a90e2"
                  maximumTrackTintColor={isDarkMode ? "#555" : "#d3d3d3"}
                  thumbTintColor={isDarkMode ? "#fff" : "#2c3e50"}
                  accessibilityLabel={`Emotion intensity level ${emotionIntensity}`}
                  accessibilityRole="adjustable"
                  accessibilityHint="Slide to set the intensity of your emotion from 1 to 10"
                />
              </>
            )}
          </View>

          <View style={getBackgroundStyle(styles.sectionContainer)}>
            <Text style={getTextStyle(styles.sectionTitle)} accessibilityRole="header">To</Text>
            <FlatList
              data={recipients}
              renderItem={({ item }) => renderTag(
                item,
                selectedRecipient === item,
                () => handleTagSelection({
                  tag: item,
                  setter: setSelectedRecipient,
                  customSetter: setCustomRecipient,
                  category: 'recipient'
                }),
                'recipient'
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
              removeClippedSubviews={false}
            />
            {selectedRecipient === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight,
                  fontSize === 'small' ? styles.textSmall :
                    fontSize === 'medium' ? styles.textMedium : styles.textLarge
                ]}
                placeholder="Type your recipient"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                value={customRecipient}
                onChangeText={setCustomRecipient}
                accessibilityLabel="Custom recipient input"
                accessibilityRole="text"
              />
            )}
          </View>

          <View style={getBackgroundStyle(styles.sectionContainer)}>
            <Text style={getTextStyle(styles.sectionTitle)} accessibilityRole="header">Where</Text>
            <FlatList
              data={scenarios}
              renderItem={({ item }) => renderTag(
                item,
                selectedScenario === item,
                () => handleTagSelection({
                  tag: item,
                  setter: setSelectedScenario,
                  customSetter: setCustomScenario,
                  category: 'scenario'
                }),
                'scenario'
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
              removeClippedSubviews={false}
            />
            {selectedScenario === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight,
                  fontSize === 'small' ? styles.textSmall :
                    fontSize === 'medium' ? styles.textMedium : styles.textLarge
                ]}
                placeholder="Type your scenario"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                value={customScenario}
                onChangeText={setCustomScenario}
                accessibilityLabel="Custom scenario input"
                accessibilityRole="text"
              />
            )}
          </View>

          <View style={getBackgroundStyle(styles.sectionContainer)}>
            <Text style={getTextStyle(styles.sectionTitle)} accessibilityRole="header">Purpose</Text>
            <FlatList
              data={purposeOptions}
              renderItem={({ item }) => renderTag(
                item,
                selectedPurpose === item,
                () => handleTagSelection({
                  tag: item,
                  setter: setSelectedPurpose,
                  customSetter: setCustomPurpose,
                  category: 'purpose'
                }),
                'purpose'
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
              removeClippedSubviews={false}
            />
            {selectedPurpose === "Other" && (
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.inputDark : styles.inputLight,
                  fontSize === 'small' ? styles.textSmall :
                    fontSize === 'medium' ? styles.textMedium : styles.textLarge
                ]}
                placeholder="Type your purpose"
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                value={customPurpose}
                onChangeText={setCustomPurpose}
                accessibilityLabel="Custom purpose input"
                accessibilityRole="text"
              />
            )}
          </View>

          {/* What happened section with voice input option */}
          <View style={getBackgroundStyle(styles.sectionContainer)}>
            <Text style={getTextStyle(styles.sectionTitle)} accessibilityRole="header">
              What happened? (Optional)
            </Text>
            <View style={styles.voiceInputContainer}>
              <TextInput
                style={[
                  styles.inputMultiline,
                  isDarkMode ? styles.inputDark : styles.inputLight,
                  fontSize === 'small' ? styles.textSmall :
                    fontSize === 'medium' ? styles.textMedium : styles.textLarge
                ]}
                placeholder="Describe what happened..."
                placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                value={whatHappened}
                onChangeText={setWhatHappened}
                multiline={true}
                numberOfLines={3}
                accessibilityLabel="What happened input"
                accessibilityRole="text"
                accessibilityHint="Describe what happened to generate a more specific response"
              />
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isRecording && styles.recordingActive
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                accessibilityLabel={isRecording ? "Stop recording" : "Start voice recording"}
                accessibilityRole="button"
                accessibilityHint="Use voice instead of typing"
              >
                <FontAwesome
                  name={isRecording ? "stop" : "microphone"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              loading && styles.generateButtonDisabled
            ]}
            onPress={generateExpression}
            disabled={loading}
            accessibilityLabel={loading ? "Generating response" : "Generate response"}
            accessibilityRole="button"
            accessibilityHint="Creates a message based on your selections"
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : 'Generate'}
            </Text>
          </TouchableOpacity>

          {lastMessage ? (
            <View style={getBackgroundStyle(styles.resultContainer)}>
              <Text
                style={getTextStyle(styles.messageText)}
                accessibilityRole="text"
              >
                {lastMessage}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={copyToClipboard}
                  disabled={!lastMessage}
                  accessibilityLabel="Copy message"
                  accessibilityRole="button"
                  accessibilityHint="Copies the message to clipboard"
                >
                  <FontAwesome name="copy" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => speakText(lastMessage)}
                  disabled={!lastMessage}
                  accessibilityLabel="Speak message"
                  accessibilityRole="button"
                  accessibilityHint="Reads the message aloud"
                >
                  <FontAwesome name="volume-up" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Speak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => savePhraseToStorage(lastMessage)}
                  disabled={!lastMessage}
                  accessibilityLabel="Save message"
                  accessibilityRole="button"
                  accessibilityHint="Saves this message to your saved phrases"
                >
                  <FontAwesome name="bookmark" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowAddMore(true)}
                  disabled={!lastMessage}
                  accessibilityLabel="Try again"
                  accessibilityRole="button"
                  accessibilityHint="Add more details and regenerate the message"
                >
                  <FontAwesome name="refresh" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>

              {showAddMore && (
                <View style={getBackgroundStyle(styles.addMoreContainer)}>
                  <Text
                    style={getTextStyle(styles.addMoreLabel)}
                    accessibilityRole="text"
                  >
                    Add more details:
                  </Text>
                  <TextInput
                    style={[
                      styles.inputMultiline,
                      isDarkMode ? styles.inputDark : styles.inputLight,
                      fontSize === 'small' ? styles.textSmall :
                        fontSize === 'medium' ? styles.textMedium : styles.textLarge
                    ]}
                    placeholder="What else would you like to express?"
                    placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
                    value={additionalInput}
                    onChangeText={setAdditionalInput}
                    multiline
                    accessibilityLabel="Additional details input"
                    accessibilityRole="text"
                  />
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={generateExpression}
                    accessibilityLabel="Regenerate message"
                    accessibilityRole="button"
                  >
                    <Text style={styles.regenerateButtonText}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      {renderAccessibilityModal()}
      {renderSavedPhrasesModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  backgroundLight: {
    backgroundColor: '#f5f7fa',
  },
  backgroundDark: {
    backgroundColor: '#1a1a1a',
  },
  highContrastLight: {
    backgroundColor: '#ffffff',
  },
  highContrastDark: {
    backgroundColor: '#000000',
  },

  // Text styles
  textLight: {
    color: '#2c3e50',
  },
  textDark: {
    color: '#f5f7fa',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 20,
  },
  highContrastText: {
    color: '#000000',
    fontWeight: '600',
  },

  // Header and section styles
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
    position: 'relative',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  // Tag styles
  tag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 48, // Accessibility - minimum touch target size
  },
  selectedTag: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  selectedTagDark: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  highContrastTag: {
    borderWidth: 2,
    borderColor: '#000',
  },
  highContrastTagDark: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  tagText: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#ffffff',
  },
  selectedTagTextDark: {
    color: '#ffffff',
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    minHeight: 48, // Accessibility - minimum touch target size
  },
  inputMultiline: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLight: {
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#f5f7fa',
    borderColor: '#555',
  },

  // Slider styles
  sliderLabel: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // Button styles
  iconButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 5,
    zIndex: 1,
    minWidth: 30,
    minHeight: 30,
  },
  generateButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 52, // Accessibility - minimum touch target size
  },
  generateButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Result container styles
  resultContainer: {
    borderRadius: 12,
    padding: 5,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    margin: 4,
    minHeight: 44, // Accessibility - minimum touch target size
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  // Additional input styles
  addMoreContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  addMoreLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  regenerateButton: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48, // Accessibility - minimum touch target size
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  // Voice input styles
  voiceInputContainer: {
    position: 'relative',
  },
  voiceButton: {
    position: 'absolute',
    right: 10,
    bottom: 25,
    backgroundColor: '#4a90e2',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#e74c3c',
  },

  // Accessibility toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    minWidth: 120,
    minHeight: 48,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  // Font size selector
  fontSizeButtons: {
    flexDirection: 'row',
  },
  fontSizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFontButton: {
    backgroundColor: '#4a90e2',
  },
  fontSizeButtonText: {
    fontWeight: '600',
  },

  // Saved phrases
  savedPhraseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  savedPhraseText: {
    flex: 1,
    paddingRight: 10,
  },
  savedPhraseActions: {
    flexDirection: 'row',
  },
  savedPhraseAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  emptyStateText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#95a5a6',
  },
});