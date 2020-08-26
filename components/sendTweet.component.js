import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, AsyncStorage, ActivityIndicator  } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { UserContext, UserProvider } from '../context';
import { FontAwesome5 } from '@expo/vector-icons';
import Toast from 'react-native-simple-toast';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export const SendTweetComponent = (props) => {
    const state = {
    }

    const context = useContext(UserContext);

    const [isSending, setIsSending] = useState(false)
    const [tweet, setTweet] = useState('');
    const [attachment, setAttachment] = useState(null);

    const addAttachment = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                return;
            }
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
        })
        if(result.cancelled) return;
        else setAttachment(result);
    }

    const send = async () => {
        const formData = new FormData();
        formData.append('tweet', tweet);

        if(attachment){
            const localUri = attachment.uri;
            const filename = localUri.split('/').pop();
            const match = filename.match(/\.(\w+)$/);
            const type = match? `image/${match[1]}` : 'image';

            formData.append('attachment', { uri: localUri, name: filename, type }, 'attachment');
        }

        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/tweet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token
            },
            body: formData
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            setTweet('');
            setAttachment(null);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.sendTweet}>
                <TouchableOpacity 
                    disabled={isSending}
                    onPress={addAttachment}
                >
                    <FontAwesome5 name="image" style={attachment? styles.addAttachmentBtnColored : styles.addAttachmentBtn} />
                </TouchableOpacity>
                <TextInput 
                    style={styles.sendTweetInput}
                    placeholder="send tweet"
                    multiline={true}
                    value={tweet}
                    onChangeText={value => setTweet(value)}
                />
                <TouchableOpacity 
                    disabled={isSending || tweet.length < 10}
                    onPress={send}
                >
                    <FontAwesome5 name="snowflake" style={isSending ? styles.sendingTweetBtn : styles.sendTweetBtn} />
                </TouchableOpacity>
                {isSending && <ActivityIndicator color="blue" animating={isSending} />}
            </View>
        </View>
    )
}

const iconSize = 20;
const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    sendTweet: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    sendTweetInput: {
        flex: 1,
        marginHorizontal: 10,
    },
    sendTweetBtn: {
        color: "#888",
        fontSize: iconSize,
    },
    sendingTweetBtn: {
        color: "#f1f1f1",
        fontSize: iconSize,
    },
    addAttachmentBtn: {
        color: "#888",
        fontSize: iconSize,
    },
    addAttachmentBtnColored: {
        color: colors.successColor,
        fontSize: iconSize,
    }
});