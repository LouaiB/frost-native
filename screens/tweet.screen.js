import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, AsyncStorage, FlatList  } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { TweetComponent } from '../components/tweet.component';

export const TweetScreen = ({ route, navigation }) => {

    const { tweet } = route.params;

    const state = {
    }

    return (
        <View style={styles.container}>
            <TweetComponent tweet={tweet} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
    },
    
});