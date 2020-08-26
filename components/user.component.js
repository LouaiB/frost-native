import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, Image, Button, AsyncStorage, FlatList, ActivityIndicator, ScrollView  } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { TweetComponent } from '../components/tweet.component';
import { UserContext, UserProvider } from '../context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';
import Prompt from 'react-native-input-prompt';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export const UserComponent = ({ accountId, openAccount }) => {

    const state = {
    }

    const context = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(true);
    const [isTweetsLoading, setIsTweetsLoading] = useState(false);
    const [account, setAccount] = useState(null);
    const [userFriendship, setUserFriendship] = useState(null);
    const [friends, setFriends] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [noTweets, setNoTweets] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [amount, setAmount] = useState(2);
    const [promptVisible, setPromptVisible] = useState(false);
    const [friending, setFriending] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);
    const [unfriended, setUnfriended] = useState(false);

    const getAccount = () => {
        setIsLoading(true);
        AsyncStorage.getItem(env.tokenKey).then(token => {
            fetch(`${env.apiUrl}/account/account/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            })
            .then(response => response.json())
            .then(json => {
                setIsLoading(false);
                setAccount(json.user);
                setUserFriendship(json.userFriendship);
                setFriends(json.friends);
                getTweets();
                console.log(json);
            })
            .catch(err => {
                setIsLoading(false);
                alert(err.message); 
            });

        });
    }
    useEffect(getAccount, []);

    const getTweets = () => {
        setIsTweetsLoading(true);
        AsyncStorage.getItem(env.tokenKey).then(token => {
            fetch(`${env.apiUrl}/post/accountTweets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ 
                    accountId: accountId,
                    startIndex: startIndex,
                    amount: amount
                })
            })
            .then(response => response.json())
            .then(json => {
                setIsTweetsLoading(false);
                console.log(json);

                if(json.length == 0) {
                    setNoTweets(true);
                } else {
                    setTweets([...tweets, ...json]);
                    setStartIndex(startIndex + amount);
                }
            })
            .catch(err => {
                setIsTweetsLoading(false);
                alert(err.message); 
            });

        });
    }

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
            setTweets(tweets.filter(tweet => tweet.post._id != tweetId));
            Toast.show(json.message);
        }
        
    }

    const changeNickname = async (newNickname) => {
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/changeNickname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ nickname: newNickname })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
        }
    }

    const changeAvatar = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                return;
            }
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            aspect: [1, 1],
            allowsEditing: true,
        })
        if(result.cancelled) return;

        // Upload to API
        const localUri = result.uri;
        const filename = localUri.split('/').pop();
        const match = filename.match(/\.(\w+)$/);
        const type = match? `image/${match[1]}` : 'image';

        const formData = new FormData();
        formData.append('avatar', { uri: localUri, name: filename, type }, 'avatar');

        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/changeAvatar`, {
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
        }
    }

    const sendFriendRequest = async () => {
        setFriending(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/sendFriendRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ user2Id: accountId })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            setFriendRequestSent(true);
        }
        setFriending(false);
    }

    const unfriend = async () => {
        setFriending(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/account/unfriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ friendshipId: userFriendship._id })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            setUnfriended(true);
        }
        setFriending(false);
    }

    const CustomButton = ({ onPress, title, style, disabled = false }) => (
        <TouchableOpacity onPress={onPress} style={{...styles.myBtn, ...style, ...disabled ? styles.myBtnDisabled : {}}} disabled={disabled}>
            <Text style={styles.myBtnText}>{title}</Text>
        </TouchableOpacity>
    )

    return (
        <ScrollView style={styles.container}>
            {isLoading && <ActivityIndicator style={styles.loading} color="blue" animating={isLoading} />}
            {account && friends &&
                <View>
                <View style={styles.info}>
                    <Image
                        style={styles.avatar}
                        source={account.avatar ? {
                            uri: `${env.apiUrl}/${account.avatar}`,
                        } : require('../assets/avatar.png')}
                    />
                    {account.nickname && <Text style={styles.nickname}>{account.nickname}</Text>}
                    <Text style={styles.email}>{account.email}</Text>
                    <Text style={styles.slug}>@{account.slug}</Text>
                    <Text style={styles.joinDate}>joined in: {new Date(account.createdOn).toDateString('')}</Text>
                    {context.state.userId == accountId && 
                        <View style={styles.profileActions}>
                            <CustomButton style={styles.changeAvatar} title="Change Avatar" onPress={changeAvatar} />
                            <CustomButton style={styles.changeNickname} title="Change Nickname" onPress={() => setPromptVisible(!promptVisible)} />
                        </View>
                    }
                    {context.state.userId != accountId && 
                        <View style={styles.profileActions}>
                            {(!friendRequestSent && (!userFriendship || (!userFriendship.isPending && !userFriendship.isAccepted && !userFriendship.isDeclined))) &&
                                <CustomButton style={styles.sendFriendRequest} title="Send Friend Request" onPress={sendFriendRequest} disabled={friending} />
                            }
                            {(!unfriended && userFriendship && userFriendship.isAccepted) &&
                                <CustomButton style={styles.unfriend} title="Unfriend" onPress={unfriend} disabled={friending} />
                            }
                        </View>
                    }
                </View>
                <View style={styles.friendsSection}>
                    <Text style={styles.title}>Friends</Text>
                    <ScrollView horizontal={true} style={styles.friends}>
                        {friends && friends.length > 0 && friends.map(friend => (
                            <TouchableOpacity onPress={() => openAccount(friend.friend._id)}>
                                <View style={styles.friend}>
                                    <Image
                                        style={styles.friendAvatar}
                                        source={friend.friend.avatar ? {
                                            uri: `${env.apiUrl}/${friend.friend.avatar}`,
                                        } : require('../assets/avatar.png')}
                                    />
                                    <Text style={styles.friendName}>{friend.friend.nickname || friend.friend.email}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {friends && friends.length == 0 &&
                        <Text style={styles.subtitle}>No friends</Text>
                    }
                </View>
                <View style={styles.tweetsSection}>
                    <Text style={styles.title}>Tweets</Text>
                    {tweets.map(tweet => (
                        <TweetComponent tweet={tweet} deleteTweet={deleteTweet} />
                    ))}
                    {!isTweetsLoading && !noTweets && 
                        <Text style={styles.loadBtn} onPress={getTweets}>+</Text>
                    }
                    {isTweetsLoading && <ActivityIndicator style={styles.loading2} color="blue" animating={isTweetsLoading} />}
                    {noTweets && tweets.length == 0 && <Text style={styles.subtitle}>No tweets found</Text>}
                    {noTweets && tweets.length > 0 && <Text style={styles.subtitle}>No more tweets</Text>}
                </View>
                <Prompt
                    visible={promptVisible}
                    title="Change Nickname"
                    placeholder="Type new nickname"
                    onCancel={() => setPromptVisible(false) }
                    onSubmit={text => { changeNickname(text); setPromptVisible(false); }}
                />
                </View>
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        paddingBottom: 50,
    },
    info: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 10,
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 50,
    },
    nickname: {
        fontSize: 20,
    },
    email: {

    },
    slug: {
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginTop: 5,
        marginBottom: 5,
        color: "#fff",
        backgroundColor: colors.successColor,
        borderRadius: 4,
    },
    joinDate: {
        fontSize: 10,
        color: "#888",
        fontStyle: "italic",
    },
    friendsSection: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: "#f1f1f1",
    },
    friends: {
        padding: 10,
    },
    tweetsSection: {
        paddingVertical: 20,
    },
    tweets: {

    },
    friend: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 10,
    },
    friendAvatar: {
        height: 40,
        width: 40,
        borderRadius: 50,
    },
    friendName: {
        fontSize: 10,
        color: "#555",
    },
    title: {
        textAlign: "center",
        fontSize: 25,
        color: colors.primaryColorDark,
        letterSpacing: 2,
    },
    subtitle: {
        textAlign: "center",
        fontSize: 15,
        color: colors.primaryColorDark,
        letterSpacing: 2,
    },
    loading: {
        marginTop: 50
    },
    loading2: {
        marginTop: 5
    },
    loadBtn: {
        textAlign: "center",
        fontSize: 25,
        color: colors.primaryColorDark,
    },
    profileActions: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    changeAvatar: {
        backgroundColor: colors.primaryColorDark,
    },
    changeNickname: {
        backgroundColor: colors.primaryColorDark,
    },
    sendFriendRequest: {
        backgroundColor: colors.successColor,
    },
    unfriend: {
        backgroundColor: colors.dangerColor,
    },
    myBtn: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        marginHorizontal: 5,
        borderRadius: 4,
    },
    myBtnText: {
        color: "#fff",
        fontSize: 11,
    },
    myBtnDisabled: {
        backgroundColor: "#aeaeae",
        
    },
});