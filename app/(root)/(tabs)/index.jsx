import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

const Index = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Welcome to Investor Land</Text>
            <Link href="/signin" style={styles.link}>SignInn</Link>
            <Link href="/login" style={styles.link}>Login</Link>
            <Link href="/explore" style={styles.link}>Explore</Link>
            <Link href="/profile" style={styles.link}>Profile</Link>
            <Link href="/properties/1" style={styles.link}>Property</Link>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'Rubik-Bold', // Ensure this font is loaded
    },
    link: {
        fontSize: 18,
        color: '#007AFF',
        marginVertical: 10,
    },
});

export default Index;
