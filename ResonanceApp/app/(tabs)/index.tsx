import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Resonance</Text>
                <Text style={styles.subtitle}>Communication Assistant</Text>
            </View>

            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/resonance-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Link href="./ExpressionGenerator" asChild>
                    <TouchableOpacity style={styles.button}>
                        <View style={styles.buttonContent}>
                            <FontAwesome name="bullhorn" size={24} color="#2c3e50" style={styles.buttonIcon} />
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonText}>Say For Me</Text>
                                <Text style={styles.buttonDescription}>
                                    Generate expressions to communicate your feelings
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>

                <Link href="./ExpressBetter" asChild>
                    <TouchableOpacity style={styles.button}>
                        <View style={styles.buttonContent}>
                            <FontAwesome name="comment" size={24} color="#2c3e50" style={styles.buttonIcon} />
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.buttonText}>Express Better</Text>
                                <Text style={styles.buttonDescription}>
                                    Improve how you express yourself in various contexts
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 20
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#7f8c8d',
        fontWeight: '400',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 180,
        height: 180,
    },
    buttonContainer: {
        gap: 20,
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderLeftWidth: 5,
        borderLeftColor: '#4a90e2',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        marginRight: 15,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 6,
    },
    buttonDescription: {
        fontSize: 15,
        color: '#7f8c8d',
        lineHeight: 20,
    },
});