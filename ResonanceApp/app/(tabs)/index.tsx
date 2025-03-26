import React, { useState } from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList } from 'react-native';

const GEMINI_API_KEY = 'YOUR_API_KEY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

function App() {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState('');
  const [customEmotion, setCustomEmotion] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [selectedScenarioCategory, setSelectedScenarioCategory] = useState('');
  const [selectedScenarioSubcategory, setSelectedScenarioSubcategory] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  type Message = { type: string; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const emotions = [
    { label: 'Happy', emoji: '😊', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Sad', emoji: '😢', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Angry', emoji: '😡', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Scared', emoji: '😨', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Anxious', emoji: '😰', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Overwhelmed', emoji: '😫', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Frustrated', emoji: '😤', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Excited', emoji: '🤩', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Confused', emoji: '😕', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Calm', emoji: '😌', intensity: ['Slightly', 'Moderately', 'Very'] },
    { label: 'Other', emoji: '🤔', intensity: [] }
  ];
  const recipients = ['Friend', 'Family', 'Romantic interest', 'Peers', 'Other'];
  const scenarios = [
    { category: 'School', subcategories: ['Classroom', 'Group Project', 'Test/Exam', 'Social Break', 'Lunch Break'] },
    { category: 'Home', subcategories: ['Family Discussion', 'Personal Space', 'Routine Changes', 'Sensory Overload'] },
    { category: 'Public Places', subcategories: ['Shopping', 'Restaurant', 'Transportation', 'Crowded Areas'] },
    { category: 'Workplace', subcategories: ['Meeting', 'Task Management', 'Colleague Interaction', 'Deadline Pressure'] },
    { category: 'Online', subcategories: ['Social Media', 'Online Class', 'Virtual Meeting', 'Texting'] },
    { category: 'Medical Settings', subcategories: ['Doctor Visit', 'Therapy Session', 'Dental Visit', 'Waiting Room'] },
    { category: 'Other', subcategories: [] }
  ];

  const handleTagSelection = (tag: string, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }, customSetter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: string): void; }) => {
    setter(tag);
    if (tag === 'Other') {
      customSetter('');  
    } else {
      customSetter('');
    }
  }

  const handleEmotionSelection = (emotion: string) => {
    setSelectedEmotion(emotion);
    setSelectedIntensity('');
    if (emotion === 'Other') {
      setCustomEmotion('');
    }
  };

  const handleIntensitySelection = (intensity: string) => {
    setSelectedIntensity(intensity);
  };

  const handleScenarioSelection = (category: string) => {
    setSelectedScenarioCategory(category);
    setSelectedScenarioSubcategory('');
  };

  const handleScenarioSubcategorySelection = (subcategory: string) => {
    setSelectedScenarioSubcategory(subcategory);
  };

  const generateExpression = async () => {
    setLoading(true);
    const scenarioText = selectedScenarioSubcategory 
      ? `${selectedScenarioCategory} - ${selectedScenarioSubcategory}`
      : (selectedScenarioCategory || customScenario);
    const emotionText = selectedIntensity ? `${selectedIntensity} ${customEmotion || selectedEmotion}` : (customEmotion || selectedEmotion);
    const recipientText = customRecipient || selectedRecipient;

    const prompt = {
      contents: [{ parts: [{ text: `The user is a young adult with ADHD and/or HFA who needs help expressing their feelings in a clear and constructive way. They are feeling "${emotionText}" and want to communicate with "${recipientText}" in the "${scenarioText}" context. Generate a considerate and clear message that:
1. Uses concrete, specific language
2. Includes context about why they feel this way
3. Expresses their needs or boundaries clearly
4. Maintains a constructive tone
5. Includes coping strategies if relevant
6. Uses natural, age-appropriate language
7. Avoids abstract concepts
8. Provides clear next steps or requests

The message should be written in first person ("I") and be specific to the situation. Make it natural and conversational while being clear and direct.` }] }]
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
              <View>
                <TouchableOpacity
                  style={[styles.tag, selectedEmotion === item.label && styles.selectedTag]}
                  onPress={() => handleEmotionSelection(item.label)}
                >
                  <Text style={styles.tagText}>{item.label} {item.emoji}</Text>
                </TouchableOpacity>
                {selectedEmotion === item.label && item.intensity.length > 0 && (
                  <View style={styles.intensityContainer}>
                    {item.intensity.map((intensity) => (
                      <TouchableOpacity
                        key={intensity}
                        style={[styles.intensityTag, selectedIntensity === intensity && styles.selectedIntensityTag]}
                        onPress={() => handleIntensitySelection(intensity)}
                      >
                        <Text style={styles.intensityText}>{intensity}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.label}
            horizontal={false}
            numColumns={2}
          />
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
              <View>
                <TouchableOpacity
                  style={[styles.tag, selectedScenarioCategory === item.category && styles.selectedTag]}
                  onPress={() => handleScenarioSelection(item.category)}
                >
                  <Text style={styles.tagText}>{item.category}</Text>
                </TouchableOpacity>
                {selectedScenarioCategory === item.category && item.subcategories.length > 0 && (
                  <View style={styles.subcategoryContainer}>
                    {item.subcategories.map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory}
                        style={[styles.subcategoryTag, selectedScenarioSubcategory === subcategory && styles.selectedSubcategoryTag]}
                        onPress={() => handleScenarioSubcategorySelection(subcategory)}
                      >
                        <Text style={styles.subcategoryText}>{subcategory}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.category}
            horizontal={false}
            numColumns={2}
          />
        {selectedScenarioCategory === "Other" && (
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
}

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
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
    alignItems: 'center',
  },
  selectedTag: {
    backgroundColor: '#007AFF',
  },
  tagText: {
    fontSize: 16,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
  },
  intensityTag: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    margin: 2,
  },
  selectedIntensityTag: {
    backgroundColor: '#0056b3',
  },
  intensityText: {
    fontSize: 14,
  },
  subcategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
  },
  subcategoryTag: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    margin: 2,
  },
  selectedSubcategoryTag: {
    backgroundColor: '#0056b3',
  },
  subcategoryText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  message: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginTop: 10,
  },
  messageText: {
    fontSize: 16,
  },
});

export default App;