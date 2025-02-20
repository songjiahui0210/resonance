import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#f0f8ff', // Soft azure blue for a calm look
    },
    contentContainer: {
        paddingBottom: 150,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#3b3b3b', // Dark gray for text
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#5a5a5a', // Moderate gray
    },
    tag: {
        padding: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        backgroundColor: '#b0e0e6', // Light blue (Powder blue)
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedTag: {
        backgroundColor: '#add8e6', // Lighter blue
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
    sliderLabel: {
        fontSize: 16,
        color: '#333',
        marginTop: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});

export default styles;