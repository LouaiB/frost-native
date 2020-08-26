import React, { useState, useContext, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Button, AsyncStorage, Image, TouchableOpacity, ActivityIndicator  } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { UserContext, UserProvider } from '../context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';

export const CommentComponent = (props) => {

    const tweetId = props.tweetId;
    const commentProp = props.comment;
    const deleteComment = props.deleteComment;

    const state = {
    }

    const context = useContext(UserContext);

    const [inEditMode, setInEditMode] = useState(false);
    const [isSendingEdit, setIsSendingEdit] = useState(false);
    const [comment, setComment] = useState(commentProp);
    const [editedComment, setEditedComment] = useState(comment.comment);
    const swipeableRef = useRef(null);

    const DeleteAction = () => {
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={() => { deleteComment(comment._id); swipeableRef.current.close(); }}>
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

    const edit = async () => {
        setIsSendingEdit(true);

        const token = await AsyncStorage.getItem(env.tokenKey);

        const response = await fetch(`${env.apiUrl}/post/editComment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                postId: tweetId,
                commentId: comment._id,
                newComment: editedComment
            })
        });
        const json = await response.json();

        if(!response.ok){
            Toast.show(`${response.status} : ${json.message}`);
            console.log(json);
        } else {
            Toast.show(json.message);
            setComment({ ...comment, comment: editedComment });
            setInEditMode(false);
        }

        setIsSendingEdit(false);
    }

    const renderContent = () => (
        <View style={styles.commentContainer}>
            <View style={styles.comment}>
                <View style={styles.avatarContainer}>
                    <Image
                        style={styles.avatar}
                        source={comment.poster.avatar ? {
                            uri: `${env.apiUrl}/${comment.poster.avatar}`,
                        } : require('../assets/avatar.png')}
                    />
                </View>
                <View style={styles.mid}>
                    <Text style={styles.name}>{comment.poster.nickname || comment.poster.email}</Text>
                    <Text style={styles.createdOn}>commented on: {new Date(comment.createdOn).toDateString('')} {new Date(comment.createdOn).toTimeString('').substr(0, 5)}</Text>
                    {!inEditMode &&
                        <Text>{comment.comment}</Text>
                    }
                    {inEditMode &&
                        <View style={styles.editSection}>
                            <TextInput
                                style={styles.editInput}
                                value={editedComment}
                                onChangeText={value => setEditedComment(value)}
                            />
                            <TouchableOpacity 
                                disabled={isSendingEdit || editedComment.length < 3}
                                onPress={edit}
                            >
                                <FontAwesome5 name="check" style={isSendingEdit ? styles.editingCommentBtn : styles.editCommentBtn} />
                            </TouchableOpacity>
                            {isSendingEdit && <ActivityIndicator color="blue" animating={isSendingEdit} />}
                        </View>
                    }
                </View>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            {context.state.userId == comment.poster._id &&
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={EditAction}
                // onSwipeableLeftOpen={() => setInEditMode(!inEditMode)}
                renderRightActions={DeleteAction}
                // onSwipeableRightOpen={() => deleteComment(comment._id)}
            >
                {renderContent()}
            </Swipeable>
            }

            {context.state.userId != comment.poster._id &&
                renderContent()
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    commentContainer: {
        backgroundColor: "#fff",
    },
    comment: {
        display: "flex",
        flexDirection: "row",
    },
    avatarContainer: {

    },
    avatar: {
        height: 25,
        width: 25,
        marginRight: 10,
        borderRadius: 50
    },
    mid: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    name: {
        fontSize: 15
    },
    createdOn: {
        fontSize: 10,
        fontStyle: "italic",
        color: "#888"
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
    editSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    editInput: {
        flex: 1,
    },
    editCommentBtn: {
        color: colors.successColor,
        fontSize: 15,
    },
    editingCommentBtn: {
        color: "#f1f1f1",
        fontSize: 15,
    },
});