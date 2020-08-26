import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, AsyncStorage, FlatList, ActivityIndicator  } from 'react-native';
import { globalStyles } from '../styles/style';
import { env } from '../env';
import { TweetComponent } from './tweet.component';
import Toast from 'react-native-simple-toast';
import { colors } from '../styles/style';

export const FeedComponent = ({ navigation }) => {
    const state = {
        amount: 2,
    }

    const [feed, setFeed] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [feedOver, setFeedOver] = useState(false);

    const getFeed = () => {
        setIsLoading(true);

        // Get Token
        AsyncStorage.getItem(env.tokenKey)
            .then(token => {

                fetch(`${env.apiUrl}/post/feed`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        startIndex: startIndex,
                        amount: state.amount
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setIsLoading(false);
                    if(json.length > 0){
                        setFeed([...feed, ...json]);
                        setStartIndex(startIndex + state.amount);
                    } else {
                        setFeedOver(true);
                    }
                })
                .catch(err => {
                    setIsLoading(false);
                    alert(err.message); 
                });
            });
    }
    useEffect(getFeed, []);

    const deleteTweet = async (tweetId) => {
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/removeTweet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ postId: tweetId })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            setFeed(feed.filter(tweet => tweet.post._id != tweetId));
            Toast.show(json.message);
        }
        
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={feed}
                keyExtractor={(item, index) => item.post._id}
                renderItem={item => (
                    <TweetComponent tweet={item.item} deleteTweet={deleteTweet} />
                )}
            />
            {!isLoading && !feedOver && 
                <Text style={styles.loadBtn} onPress={getFeed}>+</Text>
            }
            {!isLoading && feed && feed.length == 0 &&
                <Text style={styles.noResult}>No recent feed</Text>
            }
            {feedOver && feed.length > 0 && 
                <Text style={styles.subtitle}>No more tweets</Text>
            }
            {isLoading && 
                <ActivityIndicator style={styles.loading2} color="blue" animating={isLoading} />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 200,
    },
    noResult: {
        textAlign: "center",
        fontSize: 20,
        color: "#888",
        marginTop: "50%",
    },
    subtitle: {
        textAlign: "center",
        fontSize: 15,
        color: colors.primaryColorDark,
        letterSpacing: 2,
    },
    loading2: {
        marginTop: 5
    },
    loadBtn: {
        textAlign: "center",
        fontSize: 25,
        color: colors.primaryColorDark,
    },
});