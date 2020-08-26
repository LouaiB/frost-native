import React, { useState, useContext, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, AsyncStorage, ActivityIndicator, Switch  } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { UserContext, UserProvider } from '../context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { CommentComponent } from './comment.component';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export const TweetComponent = (props) => {
    const state = {
    }

    const deleteTweet = props.deleteTweet;
    const disableActions = props.disableActions ?? false;

    const context = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [isSendingEdit, setIsSendingEdit] = useState(false);
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [inEditMode, setInEditMode] = useState(false);
    const [keepAttachment, setKeepAttachment] = useState(true);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [tweet, setTweet] = useState(props.tweet);
    const [editedTweet, setEditedTweet] = useState(props.tweet.post.content);
    const [newAttachment, setNewAttachment] = useState(null);
    const swipeableRef = useRef(null);

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
        else setNewAttachment(result);
    }

    // const tags = tweet.post.content.match(/#[a-zA-Z0-9]+/g) || [];
    // tags.forEach(tag => tweet.post.content = tweet.post.content.replace(tag, <Text style={styles.tag}>tag</Text>));

    const getComments = () => {
        if(!commentsVisible || (comments && comments.length != 0)) return;
        setIsLoading(true);

        AsyncStorage.getItem(env.tokenKey).then(token => {
            fetch(`${env.apiUrl}/post/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ 
                    "postId": tweet.post._id
                })
            })
            .then(response => response.json())
            .then(json => {
                setIsLoading(false);
                if(commentsVisible) setComments(json);
            })
            .catch(err => {
                setIsLoading(false);
                alert(err.message); 
            });

        });
    }
    useEffect(getComments, [commentsVisible]);

    const DeleteAction = () => {
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={() => { deleteTweet(tweet.post._id); swipeableRef.current.close(); }}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        );
    }

    const EditAction = () => {
        return (
            <TouchableOpacity style={styles.editAction} onPress={() => { setInEditMode(!inEditMode); swipeableRef.current.close(); }}>
                <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
        );
    }

    const editTweet = async () => {
        setIsSendingEdit(true);

        const formData = new FormData();
        formData.append('postId', tweet.post._id);
        formData.append('newContent', editedTweet);
        formData.append('removeMedia', !!tweet.post.mediapath && !keepAttachment ? 'remove' : 'keep');

        if(newAttachment){
            const localUri = newAttachment.uri;
            const filename = localUri.split('/').pop();
            const match = filename.match(/\.(\w+)$/);
            const type = match? `image/${match[1]}` : 'image';

            formData.append('newAttachment', { uri: localUri, name: filename, type }, 'newAttachment');
        }

        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/editTweet`, {
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
            setTweet({ ...tweet, post: json.post });
            setNewAttachment(null);
            setInEditMode(false);
        }

        setIsSendingEdit(false);
    }

    const like = () => {
        AsyncStorage.getItem(env.tokenKey).then(token => {
            if(!tweet.post.likes.includes(context.state.userId)){
                fetch(`${env.apiUrl}/post/addLike`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        postId: tweet.post._id
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setTweet({...tweet, post: {...tweet.post, likes: [...tweet.post.likes, context.state.userId]}});
                })
                .catch(err => {
                    alert(err.message); 
                });
    
            } else {
                fetch(`${env.apiUrl}/post/removeLike`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        postId: tweet.post._id
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setTweet({...tweet, post: {...tweet.post, likes: tweet.post.likes.filter(id => id != context.state.userId)}});
                })
                .catch(err => {
                    alert(err.message); 
                });
            }
        });
    }

    const share = () => {
        if(tweet.poster._id == context.state.userId){
            Toast.show("you can't share your own post", Toast.LONG);
            return;
        }

        AsyncStorage.getItem(env.tokenKey).then(token => {
            if(!tweet.post.shares.includes(context.state.userId)){
                fetch(`${env.apiUrl}/post/addShare`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        postId: tweet.post._id
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setTweet({...tweet, post: {...tweet.post, shares: [...tweet.post.shares, context.state.userId]}});
                })
                .catch(err => {
                    alert(err.message); 
                });
    
            } else {
                fetch(`${env.apiUrl}/post/removeShare`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ 
                        postId: tweet.post._id
                    })
                })
                .then(response => response.json())
                .then(json => {
                    setTweet({...tweet, post: {...tweet.post, shares: tweet.post.shares.filter(id => id != context.state.userId)}});
                })
                .catch(err => {
                    alert(err.message); 
                });
            }
        });
    }

    const addComment = async () => {
        setIsSendingComment(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/addComment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                postId: tweet.post._id,
                comment: newComment
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            setNewComment('');
            setComments([ { ...json.comment, poster: json.poster }, ...comments ]);
            Toast.show(json.message);
        }

        setIsSendingComment(false);
    }

    const deleteComment = async commentId => {
        setIsSendingComment(true);
        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/removeComment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                postId: tweet.post._id,
                commentId
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            setComments(comments.filter(c => c._id != commentId));
            Toast.show(json.message);
        }

        setIsSendingComment(false);
    }

    const renderContent = () => (
        <View style={styles.container}>
            <View style={styles.tweet}>
                <View style={styles.avatarContainer}>
                    <Image
                        style={styles.avatar}
                        source={tweet.poster.avatar? {
                            uri: `${env.apiUrl}/${tweet.poster.avatar}`,
                        } : require('../assets/avatar.png')}
                    />
                </View>
                <View style={styles.mid}>
                    <Text style={styles.name}>{tweet.poster.nickname || tweet.poster.email}
                        {tweet.reposter &&
                            <Text style={styles.sharedBy}>{' '}[<FontAwesome5 name="retweet"/> by {tweet.reposter.nickname || tweet.reposter.email}]</Text>
                        }
                    </Text>
                    <Text style={styles.createdOn}>tweeted on: {new Date(tweet.post.createdOn).toDateString('')} {new Date(tweet.post.createdOn).toTimeString('').substr(0, 5)}</Text>
                    {!inEditMode && 
                    <View>
                        {tweet.post.mediapath &&
                        <Image
                            style={styles.attachment}
                            source={{
                                uri: `${env.apiUrl}/${tweet.post.mediapath}`,
                            }}
                        />
                        }
                        <Text>{tweet.post.content}</Text>
                    </View>
                    }
                    {inEditMode && 
                    <View>
                        {tweet.post.mediapath &&
                        <Image
                            style={styles.attachment}
                            source={{
                                uri: `${env.apiUrl}/${tweet.post.mediapath}`,
                            }}
                        />
                        }
                        <View style={styles.editTweet}>
                            <TouchableOpacity 
                                disabled={isSendingEdit}
                                onPress={addAttachment}
                            >
                                <FontAwesome5 name="image" style={newAttachment ? styles.addAttachmentBtnColored : styles.addAttachmentBtn} />
                            </TouchableOpacity>
                            <TextInput 
                                style={styles.editTweetInput}
                                value={editedTweet}
                                onChangeText={value => setEditedTweet(value)}
                            />
                            
                        </View>
                        <View style={styles.editActions}>
                            {tweet.post.mediapath &&
                            <View style={styles.leftEditActions}>
                                <Text>Keep attachment?</Text>
                                <Switch 
                                    value={keepAttachment}
                                    onValueChange={value => setKeepAttachment(value)}
                                />
                            </View>
                            }
                            <TouchableOpacity 
                                disabled={isSendingEdit || editedTweet.length < 10}
                                onPress={editTweet}
                            >
                                <FontAwesome5 name="check" style={isSendingEdit ? styles.editingTweetBtn : styles.editTweetBtn} />
                            </TouchableOpacity>
                            {isSendingEdit && <ActivityIndicator color="blue" animating={isSendingEdit} />}
                        </View>
                    </View>
                    }
                    <View style={{...styles.actions, display: disableActions ? "none" : "flex"}}>
                        <TouchableOpacity onPress={like}>
                            <View style={styles.action}>
                                <FontAwesome5 
                                    color={tweet.post.likes.includes(context.state.userId) ? colors.primaryColor : '#888'}
                                    style={styles.actionIcon}
                                    name="thumbs-up" />
                                <Text style={styles.actionText}>{tweet.post.likes.length}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={share}>
                            <View style={styles.action}>
                                <FontAwesome5 
                                    color={tweet.post.shares.includes(context.state.userId) ? colors.primaryColor : '#888'}
                                    style={styles.actionIcon}
                                    name="retweet" />
                                <Text style={styles.actionText}>{tweet.post.shares.length}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCommentsVisible(!commentsVisible)}>
                            <View style={styles.action}>
                                <FontAwesome5
                                    color={tweet.post.comments.some(c => c.userId == context.state.userId) ? colors.primaryColor : '#888'}
                                    style={styles.actionIcon}
                                    name="comment" />
                                <Text style={styles.actionText}>{tweet.post.comments.length}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {commentsVisible && 
                <View style={styles.comments}>
                    <Text>Comments ({tweet.post.comments.length})</Text>
                    <View style={styles.addComment}>
                        <TextInput
                            style={styles.addCommentInput}
                            placeholder="add comment.."
                            value={newComment}
                            onChangeText={value => setNewComment(value)}
                        />
                        <TouchableOpacity onPress={addComment} disabled={newComment.length < 3}>
                            <FontAwesome name="send" style={styles.addCommentBtn} />
                        </TouchableOpacity>
                        {isSendingComment && <ActivityIndicator color="blue" animating={isSendingComment} />}
                    </View>
                    {isLoading &&
                        <ActivityIndicator style={styles.loading} color="blue" animating={isLoading} />
                    }
                    {comments.length > 0 &&
                        <FlatList
                            data={comments}
                            keyExtractor={(item, index) => item._id}
                            renderItem={item => (
                                <CommentComponent comment={item.item} tweetId={tweet.post._id} deleteComment={deleteComment} />
                            )}
                        />
                    }
                </View>
            }
        </View>
    )

    return (
        <View>
            {context.state.userId == tweet.poster._id &&
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={EditAction}
                // onSwipeableLeftOpen={() => setInEditMode(!inEditMode)}
                renderRightActions={DeleteAction.bind(this)}
                // onSwipeableRightOpen={() => deleteTweet(tweet.post._id)}
            >
                {renderContent()}
            </Swipeable>
            }

            {context.state.userId != tweet.poster._id &&
                renderContent()
            }
        </View>
    )
}

const iconSize = 20;
const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomColor: "#88888833",
        borderBottomWidth: 1,
        backgroundColor: "#fff",
    },
    tweet: {
        display: "flex",
        flexDirection: "row",
    },
    actions: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },
    action: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20
    },
    actionIcon: {
        marginRight: 5,
        fontSize: 15
    },
    actionText: {
        fontSize: 14
    },
    avatarContainer: {

    },
    avatar: {
        height: 40,
        width: 40,
        marginRight: 10,
        borderRadius: 50
    },
    attachment: {
        width: "90%",
        height: 300,
        marginVertical: 10,
    },
    mid: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    editSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "flex-end",
    },
    name: {
        fontSize: 20
    },
    createdOn: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#888"
    },
    comments: {
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    addComment: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    addCommentInput: {
        flex: 1,
        marginRight: 10,
    },
    addCommentBtn: {
        color: "#888",
        fontSize: 15,
    },
    loading: {
        marginTop: 10
    },
    deleteAction: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100%",
        backgroundColor: colors.dangerColor,
        paddingHorizontal: 20,
    },
    deleteText: {
        color: "#fff",
        fontSize: 30, 
    },
    editAction: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100%",
        backgroundColor: colors.editColor,
        paddingHorizontal: 20,
    },
    editText: {
        color: "#fff",
        fontSize: 30,
    },
    sharedBy: {
        color: "#888",
        fontSize: 12,
    },
    editTweet: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    editTweetInput: {
        flex: 1,
        marginHorizontal: 10,
    },
    editTweetBtn: {
        color: colors.successColor,
        fontSize: iconSize,
    },
    editingTweetBtn: {
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
    },
    editActions: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    leftEditActions: {
        flex: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    }
});