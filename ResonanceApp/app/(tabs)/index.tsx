import React, { useState } from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList } from 'react-native';

const GEMINI_API_KEY = 'AIzaSyCczzTtUSstlsoktQtekaA19eDkQHWLGhI';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

function App() {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  type Message = { type: string; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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

    const prompt = {
      contents: [{ parts: [{ text: `The user is a young adult with language impairments and needs you to help them complete a message of expressing the feelings. The user is feeling "${emotionText}" and wants to communicate with "${recipientText}" in the "${scenarioText}" context. The scenario contexts are where the conversations will be based. Generate a considerate and clear text that the user can use to explain his true intentions in the situation, promoting a better understanding and maintaining a genuine atmosphere. Omit the user's or the recipient's name, and pretend you are writing for the user. So start with 'I'. Don't include any variable name starting with []. The recipient is whom the user is talking to. Also, generate the sentence in a natural tone just like young adults nowadays. Don't be too concise. Be natural and address context.` }] }]
    };

    try {
      const response = await axios.post(API_URL, prompt);
      const generatedText = response.data.candidates[0].content.parts[0].text || "I couldn't generate a response.";
      setMessages([...messages, { type: 'ai', text: generatedText }]);
    } catch (error) {
      setMessages([...messages, { type: 'ai', text: 'Error: Unable to generate a response.' }]);
    }
    setLoading(false);
  };
  
  return (
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
      {messages.map((msg, index) => (
        <View key={index} style={styles.message}>
          <Text style={styles.messageText}>{msg.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 150,  
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tag: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTag: {
    backgroundColor: '#cceeff',
  },
  tagText: {
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  message: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  messageText: {
    fontSize: 16,
  },
});

export default App;
