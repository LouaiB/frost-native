import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, Image, Button, TouchableOpacity, FlatList, AsyncStorage, ActivityIndicator } from 'react-native';
import { globalStyles } from '../styles/style';
import { env } from '../env';
import { FontAwesome5, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { TweetComponent } from '../components/tweet.component';
import Toast from 'react-native-simple-toast';
import { UserContext } from '../context';
import { colors } from '../styles/style';

export const FriendsScreen = ({ navigation }) => {
    const state = {
    }

    const context = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [isActioning, setIsActioning] = useState(false);
    const [friendships, setFriendships] = useState([]);

    const fetchFriendships = async () => {
        setIsLoading(true);
        setFriendships([]);

        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/friendships`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            setFriendships(json);
        }
        setIsLoading(false);
    }
    useState(fetchFriendships, []);

    const accept = async (friendshipId) => {
        setIsActioning(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/acceptFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                requestId: friendshipId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            fetchFriendships();
        }
        setIsActioning(false);
    }

    const decline = async (friendshipId) => {
        setIsActioning(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/declineFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                requestId: friendshipId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            fetchFriendships();
        }
        setIsActioning(false);
    }

    const undecline = async (friendshipId) => {
        setIsActioning(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/undeclineFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                requestId: friendshipId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            fetchFriendships();
        }
        setIsActioning(false);
    }

    const cancel = async (friendshipId) => {
        setIsActioning(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/cancelFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                requestId: friendshipId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            fetchFriendships();
        }
        setIsActioning(false);
    }

    const unfriend = async (friendshipId) => {
        setIsActioning(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/unfriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                friendshipId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            fetchFriendships();
        }
        setIsActioning(false);
    }

    return (
        <View style={styles.container}>
            
            {!isLoading && friendships && friendships.length == 0 &&
                <Text style={styles.noResult}>No results found</Text>
            }
            <FlatList
                data={friendships}
                keyExtractor={(item, index) => item.friendship._id}
                onRefresh={fetchFriendships}
                refreshing={isLoading}
                renderItem={item => (
                    <View style={styles.friend}>
                        <Image
                            style={styles.avatar}
                            source={item.item.friend.avatar ? {
                                uri: `${env.apiUrl}/${item.item.friend.avatar}`,
                            } : require('../assets/avatar.png')}
                        />
                        <TouchableOpacity 
                            style={styles.name}
                            onPress={() => navigation.navigate("Account", { accountId: item.item.friend._id })}
                        >
                            <Text>{item.item.friend.nickname || item.item.friend.email}</Text>
                        </TouchableOpacity>
                        <View style={styles.actions}>
                            {(item.item.friendship.user2Id == context.state.userId && item.item.friendship.isPending) && 
                                <TouchableOpacity
                                    style={styles.action}
                                    disabled={isActioning}
                                    onPress={() => accept(item.item.friendship._id)}
                                >
                                    <FontAwesome5 name="check" style={{...styles.actionIcon, ...styles.accept}} />
                                </TouchableOpacity>
                            }
                            {(item.item.friendship.user2Id == context.state.userId && item.item.friendship.isPending) && 
                                <TouchableOpacity
                                    style={styles.action}
                                    disabled={isActioning}
                                    onPress={() => decline(item.item.friendship._id)}
                                >
                                    <Entypo name="cross" style={{...styles.actionIcon, ...styles.decline}} />
                                </TouchableOpacity>
                            }
                            {(item.item.friendship.user2Id == context.state.userId && item.item.friendship.isDeclined) && 
                                <TouchableOpacity
                                    style={styles.action}
                                    disabled={isActioning}
                                    onPress={() => undecline(item.item.friendship._id)}
                                >
                                    <FontAwesome5 name="undo" style={{...styles.actionIcon, ...styles.undecline}} />
                                </TouchableOpacity>
                            }
                            {(item.item.friendship.user1Id == context.state.userId && item.item.friendship.isPending) && 
                                <TouchableOpacity
                                    style={styles.action}
                                    disabled={isActioning}
                                    onPress={() => cancel(item.item.friendship._id)}
                                >
                                    <MaterialCommunityIcons name="cancel" style={{...styles.actionIcon, ...styles.cancel}} />
                                </TouchableOpacity>
                            }
                            {(item.item.friendship.isAccepted) && 
                                <TouchableOpacity
                                    style={styles.action}
                                    disabled={isActioning}
                                    onPress={() => unfriend(item.item.friendship._id)}
                                >
                                    <FontAwesome5 name="trash" style={{...styles.actionIcon, ...styles.unfriend}} />
                                </TouchableOpacity>
                            }
                            {isLoading && <ActivityIndicator color="blue" animating={isActioning} />}
                        </View>
                    </View>
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
    },
    friend: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 50,
        marginRight: 10,
    },
    name: {
        flex: 1,
    },
    actions: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    action: {
        marginHorizontal: 10,
    },
    actionIcon: {
        fontSize: 14,
        color: "#fff",
        borderRadius: 50,
        padding: 10,
    },
    accept: {
        backgroundColor: colors.successColor,
    },
    decline: {
        backgroundColor: colors.dangerColor,
    },
    undecline: {
        backgroundColor: colors.editColor,
    },
    cancel: {
        backgroundColor: "#555",
    },
    unfriend: {
        backgroundColor: colors.dangerColor,
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