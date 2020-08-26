import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, FlatList, AsyncStorage, ActivityIndicator, Image } from 'react-native';
import { globalStyles } from '../styles/style';
import { env } from '../env';
import { FontAwesome5 } from '@expo/vector-icons';

export const SearchUsersScreen = ({ navigation }) => {
    const state = {
    }

    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [users, setUsers] = useState([]);

    const search = () => {
        if(query.length == 0) return;
        setUsers([]);
        setIsLoading(true);
        setNoResults(false);

        AsyncStorage.getItem(env.tokenKey).then(token => {
            fetch(`${env.apiUrl}/account/searchUsers`, {
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
                setUsers(json.users);

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
                    placeholder="search users.."
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
                data={users}
                keyExtractor={(item, index) => item._id}
                renderItem={item => (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Account", { accountId: item.item._id })}
                    >
                        <View style={styles.user}>
                            <Image
                                style={styles.avatar}
                                source={item.item.avatar ? {
                                    uri: `${env.apiUrl}/${item.item.avatar}`,
                                } : require('../assets/avatar.png')}
                            />
                            <Text style={styles.name}>{item.item.nickname || item.item.email}</Text>
                        </View>
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
        paddingBottom: 50,
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
    },
    user: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#88888855",
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 50,
    },
    name: {
        marginLeft: 10
    }
    
});