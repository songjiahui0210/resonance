import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

const GEMINI_API_KEY = 'YOUR_API_KEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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


  const generateExpression = async () => {
    setLoading(true);
    const scenarioText = customScenario || selectedScenario;
    const emotionText = customEmotion || selectedEmotion;
    const recipientText = customRecipient || selectedRecipient;
    const purposeText = customPurpose || selectedPurpose;

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
        
        Start the message with 'I' and write in authentic tone. Avoid using  numbers to describe the emotion intensity; instead, use descriptive language to convey the emotion strength based on the intensity level provided, combining with what happens. Write directly for them so that they can read it directly. Don't add anything in the brackets.`

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.header}>How are you feeling today?</Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Emotions</Text>
            <TouchableOpacity onPress={() => setShowDetailedEmotions(!showDetailedEmotions)} style={styles.iconButton}>
              <FontAwesome name="plus" size={20} color="#4a90e2" />
            </TouchableOpacity>
            <FlatList
              data={emotions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tag, selectedEmotion === item && styles.selectedTag]}
                  onPress={() => handleTagSelection({ tag: item, setter: setSelectedEmotion, customSetter: setCustomEmotion, category: 'emotion' })}
                >
                  <Text style={[styles.tagText, selectedEmotion === item && styles.selectedTagText]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
            />
            {showDetailedEmotions && (
              <FlatList
                data={detailedEmotions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.tag, selectedEmotion === item && styles.selectedTag]}
                    onPress={() => setSelectedEmotion(item)}
                  >
                    <Text style={[styles.tagText, selectedEmotion === item && styles.selectedTagText]}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                horizontal={false}
                numColumns={2}
              />
            )}
            {selectedEmotion === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Type your emotion"
                value={customEmotion}
                onChangeText={setCustomEmotion}
              />
            )}
            {(selectedEmotion !== '' || customEmotion) && (
              <>
                <Text style={styles.sliderLabel}>Level: {emotionIntensity}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={emotionIntensity}
                  onValueChange={(value) => setEmotionIntensity(value)}
                  minimumTrackTintColor="#4a90e2"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#2c3e50"
                />
              </>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>To</Text>
            <FlatList
              data={recipients}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tag, selectedRecipient === item && styles.selectedTag]}
                  onPress={() => handleTagSelection({ tag: item, setter: setSelectedRecipient, customSetter: setCustomRecipient, category: 'recipient' })}
                >
                  <Text style={[styles.tagText, selectedRecipient === item && styles.selectedTagText]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
            />
            {selectedRecipient === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Type your recipient"
                value={customRecipient}
                onChangeText={setCustomRecipient}
              />
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Where</Text>
            <FlatList
              data={scenarios}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tag, selectedScenario === item && styles.selectedTag]}
                  onPress={() => handleTagSelection({ tag: item, setter: setSelectedScenario, customSetter: setCustomScenario, category: 'scenario' })}
                >
                  <Text style={[styles.tagText, selectedScenario === item && styles.selectedTagText]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
            />
            {selectedScenario === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Type your scenario"
                value={customScenario}
                onChangeText={setCustomScenario}
              />
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Purpose</Text>
            <FlatList
              data={purposeOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tag, selectedPurpose === item && styles.selectedTag]}
                  onPress={() => handleTagSelection({
                    tag: item,
                    setter: setSelectedPurpose,
                    customSetter: setCustomPurpose,
                    category: 'purpose'
                  })}
                >
                  <Text style={[styles.tagText, selectedPurpose === item && styles.selectedTagText]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal={false}
              numColumns={2}
            />
            {selectedPurpose === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Type your purpose"
                value={customPurpose}
                onChangeText={setCustomPurpose}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateExpression}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>{loading ? 'Generating...' : 'Generate'}</Text>
          </TouchableOpacity>

          {lastMessage ? (
            <View style={styles.resultContainer}>
              <Text style={styles.messageText}>{lastMessage}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={copyToClipboard}
                  disabled={!lastMessage}
                >
                  <FontAwesome name="copy" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowAddMore(true)}
                  disabled={!lastMessage}
                >
                  <FontAwesome name="refresh" size={16} color="#fff" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>

              {showAddMore && (
                <View style={styles.addMoreContainer}>
                  <Text style={styles.addMoreLabel}>Add more details:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What else would you like to express?"
                    value={additionalInput}
                    onChangeText={setAdditionalInput}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={generateExpression}
                  >
                    <Text style={styles.regenerateButtonText}>Regenerate</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 25,
    color: '#2c3e50',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
    position: 'relative',
    backgroundColor: '#ffffff',
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
    color: '#2c3e50',
  },
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
  },
  selectedTag: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  tagText: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#2c3e50',
  },
  sliderLabel: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#4a4a4a',
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  iconButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 5,
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
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
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
    color: '#2c3e50',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    minWidth: 120,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  addMoreContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  addMoreLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
  },
  regenerateButton: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});