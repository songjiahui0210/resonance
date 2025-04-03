import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

export default function ExpressBetter() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="comment" size={60} color="#4a90e2" />
                </View>
                <Text style={styles.title}>Express Better</Text>
                <Text style={styles.subtitle}>Coming Soon</Text>
                <Text style={styles.description}>
                    We're working on tools to help you improve how you express yourself in different situations.
                </Text>
                <View style={styles.featureContainer}>
                    <View style={styles.featureItem}>
                        <FontAwesome name="check-circle" size={22} color="#4a90e2" style={styles.featureIcon} />
                        <Text style={styles.featureText}>Personalized expression suggestions</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <FontAwesome name="check-circle" size={22} color="#4a90e2" style={styles.featureIcon} />
                        <Text style={styles.featureText}>Practice exercises for different contexts</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <FontAwesome name="check-circle" size={22} color="#4a90e2" style={styles.featureIcon} />
                        <Text style={styles.featureText}>Communication strategy guides</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '500',
        color: '#4a90e2',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 40,
        maxWidth: 300,
        lineHeight: 24,
    },
    featureContainer: {
        alignSelf: 'stretch',
        marginHorizontal: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    featureIcon: {
        marginRight: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#2c3e50',
        flex: 1,
    },
});