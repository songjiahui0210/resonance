import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#4a90e2',
      tabBarInactiveTintColor: '#8e8e93',
      tabBarStyle: {
        backgroundColor: '#f8f9fa',
        borderTopColor: '#e0e0e0',
      },
    }}>
      <Tabs.Screen
        name="ExpressionGenerator"
        options={{
          title: 'Say For Me',
          tabBarIcon: ({ color, size }) => <FontAwesome name="bullhorn" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="express-better"
        options={{
          title: 'Express Better',
          tabBarIcon: ({ color, size }) => <FontAwesome name="comment" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}