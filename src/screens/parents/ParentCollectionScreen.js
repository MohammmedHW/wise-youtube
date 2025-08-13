import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ParentCollectionScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Playlist')}>
                <Text style={styles.cardText}>Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Channel List')}>
                <Text style={styles.cardText}>Channel</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ParentCollectionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    card: {
        backgroundColor: '#3498db',
        padding: 20,
        margin: 10,
        borderRadius: 10,
        width: '50%', // Set width to 80% of the screen width
        aspectRatio: 1, // Maintain aspect ratio (square shape)
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Add shadow for a raised effect
    },
    cardText: {
        fontSize: 24,
        fontWeight: 'bold',
        color:"white"
    },
});
