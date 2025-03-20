import React, { useState } from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Clipboard, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import styles from '../appStyles';

const GEMINI_API_KEY = 'YOUR_API_KEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


function App() {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  type Message = { type: string; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [additionalInput, setAdditionalInput] = useState('');
  const [showDetailedEmotions, setShowDetailedEmotions] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState(''); // new state for user's selected purpose
  const [customPurpose, setCustomPurpose] = useState(''); // new state for user's custom purpose


  const emotions = ['Happy 😊', 'Sad 😢', 'Angry 😡', 'Worried 😨', 'Other'];
  const detailedEmotions = ['Overwhelmed', 'Stressed', 'Anxious', 'Frustrated', 'Annoyed', 'Nervous'];
  const recipients = ['Friend', 'Family', 'Romantic interest', 'Peers', 'Other'];
  const scenarios = ['School', 'Home', 'Public places', 'Workplace', 'Online', 'Medical Settings', 'Other'];
  const purposeOptions = ['Express feelings', 'Seek help', 'Other']; // new purpose options


  const handleTagSelection = (tag: string, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }, customSetter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: string): void; }) => {
    setter(tag);
    if (tag === 'Other') {
      customSetter('');
    } else {
      customSetter('');
    }
  }

  const generateExpression = async () => {
    setLoading(true);
    const scenarioText = customScenario || selectedScenario;
    const emotionText = customEmotion || selectedEmotion;
    const recipientText = customRecipient || selectedRecipient;
    const purposeText = customPurpose || selectedPurpose; // new purpose text
    const additionalText = additionalInput ? ` Additional information: ${additionalInput}` : '';


    const prompt = {
      contents: [{
        parts: [{
          text: `The user is a young adult with language impairments and needs you to write a few sentences of expressing their feelings for them.
        
        The user is feeling "${emotionText}" at an intensity level of ${emotionIntensity} on a scale from 1 to 10, where 1 is very mild and 10 is very strong. They want to communicate with "${recipientText}" in the "${scenarioText}" context. The purpose is to: ${purposeText}.${additionalText}

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
      const err = error as any;
      console.error('Error while generating expression:', err.response ? err.response.data : err.message);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessages([...messages, { type: 'ai', text: `Error: ${errorMessage}` }]);
      setLastMessage('');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    Clipboard.setString(lastMessage);
    alert('Copied to clipboard!');
  };

  return (
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
            <Icon name="plus" size={20} color="#007AFF" />
          </TouchableOpacity>
          <FlatList
            data={emotions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tag, selectedEmotion === item && styles.selectedTag]}
                onPress={() => handleTagSelection(item, setSelectedEmotion, setCustomEmotion)}
              >
                <Text style={styles.tagText}>{item}</Text>
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
                  <Text style={styles.tagText}>{item}</Text>
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
                onValueChange={setEmotionIntensity}
                minimumTrackTintColor="#1fb28a"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#b9e4c9"
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
                onPress={() => handleTagSelection(item, setSelectedRecipient, setCustomRecipient)}
              >
                <Text style={styles.tagText}>{item}</Text>
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
                onPress={() => handleTagSelection(item, setSelectedScenario, setCustomScenario)}
              >
                <Text style={styles.tagText}>{item}</Text>
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

        {/* Purpose Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Purpose</Text>
          <FlatList
            data={purposeOptions} // new data array for purpose
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tag, selectedPurpose === item && styles.selectedTag]} // new selectedPurpose
                onPress={() => setSelectedPurpose(item)} // setSelectedPurpose for purpose selection
              >
                <Text style={styles.tagText}>{item}</Text>
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
              value={customPurpose} // new customPurpose input
              onChangeText={setCustomPurpose} // new customPurpose setter
            />
          )}
        </View>

        <Button
          title={loading ? 'Loading...' : 'Generate'}
          onPress={generateExpression}
          disabled={loading}
        />
        {lastMessage ? (
          <>
            <Text style={styles.messageText}>{lastMessage}</Text>
            <Button
              title="Give me another try"
              onPress={() => {
                setAdditionalInput(''); // Clear additional input for fresh entry
                generateExpression(); // Regenerate without waiting for additional input
              }}
              disabled={loading}
            />
            <Text>Is there anything you want to add?</Text>
            <TextInput
              style={styles.input}
              placeholder="Add more details"
              value={additionalInput}
              onChangeText={setAdditionalInput}
              onSubmitEditing={generateExpression} // Optionally trigger generation on submit
            />
            <Button
              title="Copy"
              onPress={copyToClipboard}
              disabled={!lastMessage}
            />
          </>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};


export default App;