import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, FlatList, AsyncStorage, ActivityIndicator } from 'react-native';
import { globalStyles } from '../styles/style';
import { env } from '../env';
import { FontAwesome5 } from '@expo/vector-icons';
import { TweetComponent } from '../components/tweet.component';

export const SearchTweetsScreen = ({ navigation }) => {
    const state = {
    }

    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [tweets, setTweets] = useState([]);

    const search = () => {
        if(query.length == 0) return;
        setTweets([]);
        setIsLoading(true);
        setNoResults(false);

            AsyncStorage.getItem(env.tokenKey).then(token => {
                fetch(`${env.apiUrl}/post/searchTweets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        query
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setIsLoading(false);
                    setTweets(json);

                    if(json.length == 0) setNoResults(true);
                })
                .catch(err => {
                    setIsLoading(false);
                    alert(err.message); 
                });

            });
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchbox}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="search tweets.."
                    onChangeText={value => setQuery(value)}
                    />
                <TouchableOpacity onPress={search} disabled={isLoading}>
                    <FontAwesome5 style={styles.searchBtn} name="search" />
                </TouchableOpacity>
            </View>
            {isLoading &&
                <ActivityIndicator style={styles.loading} color="blue" animating={isLoading} />
            }
            {noResults &&
                <Text style={styles.noResult}>No results found</Text>
            }
            <FlatList
                data={tweets}
                keyExtractor={(item, index) => item.post._id}
                renderItem={item => (
                    <TouchableOpacity onPress={() => navigation.navigate("Tweet", { tweet: item.item })}>
                        <TweetComponent tweet={item.item} disableActions={true} />
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: "100%",
        backgroundColor: '#fff',
        display: "flex",
        flexDirection: "column",
        padding: 10,
    },
    searchbox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    searchInput: {
        flex: 1,
        marginRight: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 3,
    },
    searchBtn: {
        color: "#888",
        fontSize: 20,
        paddingHorizontal: 10,
    },
    loading: {
        marginTop: 50
    },
    noResult: {
        textAlign: "center",
        fontSize: 20,
        color: "#888",
        marginTop: "50%",
    }
    
});