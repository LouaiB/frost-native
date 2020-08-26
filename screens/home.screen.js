import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { globalStyles } from '../styles/style';
import { env } from '../env';
import { FeedComponent } from '../components/feed.component';
import { SendTweetComponent } from '../components/sendTweet.component';

export const HomeScreen = ({ navigation }) => {
    const state = {
    }

    return (
        <View style={styles.container}>
            <SendTweetComponent />
            <FeedComponent />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: "100%",
        backgroundColor: '#fff',
        display: "flex",
        flexDirection: "column",
    }
    
});