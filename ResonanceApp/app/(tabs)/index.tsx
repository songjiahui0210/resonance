import React, { useState } from 'react';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Clipboard, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import styles from '../appStyles';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set in environment variables');
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const headers = {
  'Content-Type': 'application/json',
  'x-goog-api-key': apiKey
};

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


function App() {
  // emotion
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState('');
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
    const emotionText = selectedIntensity ? `${selectedIntensity} ${customEmotion || selectedEmotion}` : (customEmotion || selectedEmotion);
    const recipientText = customRecipient || selectedRecipient;
    const purposeText = customPurpose || selectedPurpose;
    const additionalText = additionalInput ? ` Additional information: ${additionalInput}` : '';

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
      const response = await axios.post(API_URL, prompt, { headers });
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

  const copyToClipboard = () => {
    Clipboard.setString(lastMessage);
    alert('Copied to clipboard!');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
                    onPress={() => handleTagSelection({ tag: item, setter: setSelectedEmotion, customSetter: setCustomEmotion, category: 'emotion' })}
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
                    onValueChange={(value) => setEmotionIntensity(value)}
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
                    onPress={() => handleTagSelection({ tag: item, setter: setSelectedRecipient, customSetter: setCustomRecipient, category: 'recipient' })}
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
                    onPress={() => handleTagSelection({ tag: item, setter: setSelectedScenario, customSetter: setCustomScenario, category: 'scenario' })}
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
              <View style={{ marginTop: 20 }}>
                <Text style={styles.messageText}>{lastMessage}</Text>
                {/* Now two buttons: "Copy" and "Give me another try" */}
                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Copy"
                    onPress={copyToClipboard}
                    disabled={!lastMessage}
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Give me another try"
                    onPress={() => setShowAddMore(true)}
                    disabled={!lastMessage}
                  />
                </View>

                {showAddMore && (
                  <View style={{ marginTop: 10 }}>
                    <Text>Is there anything you want to add?</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Add more details"
                      value={additionalInput}
                      onChangeText={setAdditionalInput}
                    />
                    <Button
                      title="Regenerate"
                      onPress={generateExpression}
                    />
                  </View>
                )}
              </View>
            ) : null}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;