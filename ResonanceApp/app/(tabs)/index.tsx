import React, { useState } from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Clipboard, KeyboardAvoidingView, Platform} from 'react-native';
import Slider from '@react-native-community/slider';
import styles from './appStyles';

const GEMINI_API_KEY = 'AIzaSyD-kdWP6u2Q-zlT-9DC5epl877QtobpuDk';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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

  const emotions = ['Happy 😊', 'Sad 😢', 'Angry 😡', 'Scared 😨', 'Other'];
  const recipients = ['Friend', 'Family', 'Romantic interest', 'Peers', 'Other'];
  const scenarios = ['School', 'Home', 'Public places', 'Workplace', 'Online', 'Medical Settings', 'Other'];

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
    const additionalText = additionalInput ? ` Additional information: ${additionalInput}` : '';
    

    const prompt = {
      contents: [{
        parts: [{
          text:
        
            `The user is a young adult with language impairments and needs you to help them complete a message of expressing the feelings. 
            
            The user is feeling "${emotionText}" with a level of ${emotionIntensity} out of 10. With level 1, it means a very mild or subtle feeling. Level 10 means very strong feeling. The user wants to communicate with "${recipientText}" in the "${scenarioText}" context. The scenario contexts are where the conversations will be based with possible ${additionalText}.
            
            Generate a considerate and clear text that the user can use to explain his or her true intentions in the situation, promoting a better understanding and maintaining a genuine atmosphere. Omit the user's or the recipient's name, and pretend you are writing for the user. So start with 'I'. Don't include any variable name starting with []. The recipient is whom the user is talking to.

            With the emotion level, don't mention it in numbers like "8 out of 10" in the text, but use words to express how intense the emotion is.
            
            Also, generate the sentence in a natural tone just like young adults nowadays within the scenarios. Don't be too concise. Be natural and address context to best express the user's feelings.`
        }]
      }]
    };

    try {
      const response = await axios.post(API_URL, prompt);
      const generatedText = response.data.candidates[0].content.parts[0].text || "I couldn't generate a response.";
      setMessages([...messages, { type: 'ai', text: generatedText }]);
      setLastMessage(generatedText);
      
    } catch (error) {
      setMessages([...messages, { type: 'ai', text: "Sorry, it happens sometimes. Let me try again. " }]);
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
        {selectedEmotion === "Other" && (
          <TextInput
            style={styles.input}
            placeholder="Type your emotion"
            value={customEmotion}
            onChangeText={setCustomEmotion}
          />
        )}
        {selectedEmotion && selectedEmotion !== 'Other' && (
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
        <Text style={styles.sectionTitle}>Recipients</Text>
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
        <Text style={styles.sectionTitle}>Scenarios</Text>
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
