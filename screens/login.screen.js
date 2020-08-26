import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, Button, AsyncStorage, Image, Switch } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import { env } from '../env';
import { UserContext, UserProvider } from '../context';

export const LoginScreen = ({ navigation }) => {
    const state = {
    }

    const context = useContext(UserContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [valid, setValid] = useState(false);

    const onEmailChange = value => setEmail(value);
    const onPasswordChange = value => setPassword(value);

    const check = () => {
        setError('');
        let isValid = true;

        if(!email){
            isValid = false;
            setError('email required');
        } else if(email.match(/^[a-zA-Z0-9.]+@[a-zA-Z0-9]+.[a-z]+$/) == null){
            isValid = false;
            setError('email invalid');
        } else if(!password) {
            isValid = false;
            setError('password required');
        }

        setValid(isValid);
    }
    useEffect(check, [email, password]);

    const getSavedLogin = async () => {
        const savedEmail = await AsyncStorage.getItem('email');
        const savedPassword = await AsyncStorage.getItem('password');

        if(savedEmail) setEmail(savedEmail);
        if(savedPassword) setPassword(savedPassword);
    }

    const login = async () => {
        setIsLoading(true);
        setError('');
        const response = await fetch(`${env.apiUrl}/account/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
        
        const json = await response.json();

        if(!response.ok){
            setError(response.message);
        } else {
            await AsyncStorage.setItem(env.tokenKey, json.token);
            if(remember){
                AsyncStorage.setItem('email', email);
                AsyncStorage.setItem('password', password);
            }
    
            context.setUser({
                email,
                slug: json.slug,
                nickname: json.nickname,
                avatar: json.avatar,
                userId: json.userId,
                mentions: json.mentions
            });
    
            navigation.navigate('Main');
            setIsLoading(false);
        }
    }

    const autoLogin = () => {
        AsyncStorage.getItem(env.tokenKey)
            .then(token => {
                if(token){
                    fetch(`${env.apiUrl}/account/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token })
                    })
                    .then(response => response.json())
                    .then(json => {
                        setIsLoading(false);
                        AsyncStorage.setItem(env.tokenKey, json.token);
            
                        context.setUser({
                            email: json.user.email,
                            slug: json.user.slug,
                            nickname: json.user.nickname,
                            avatar: json.user.avatar,
                            userId: json.user._id,
                            mentions: json.user.mentions
                        });
            
                        navigation.navigate('Main');
                    })
                    .catch(err => {
                        setIsLoading(false);
                        alert(err.message); 
                    });
                } else {
                    getSavedLogin();
                }
            })
    }
    useEffect(autoLogin, []);

    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <Text style={styles.title}>Login</Text>
                <TextInput
                    value={email}
                    placeholder="email.."
                    style={styles.input}
                    onChangeText={onEmailChange}
                />
                <TextInput
                    value={password}
                    textContentType="password"
                    placeholder="password.."
                    style={styles.input}
                    onChangeText={onPasswordChange}
                />
                <View style={styles.remember}>
                    <Switch 
                        value={remember}
                        onValueChange={value => setRemember(value)}
                    />
                    <Text>Remember login?</Text>
                </View>
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Button 
                    title="Login"
                    onPress={login}
                    disabled={isLoading || !valid}
                />
                <View style={globalStyles.separatorWide} />
                <Text 
                    style={globalStyles.link}
                    onPress={() => navigation.navigate('Register')}
                >Not a member? Register</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: "100%",
        backgroundColor: colors.bgGradLight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    loginContainer: {
        width: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: 'stretch',
        justifyContent: "center",
        backgroundColor: "#f1f1f1",
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    },
    input: {
        padding: 10,
        width: "100%"
    },
    error: {
        color: colors.dangerColor,
        fontSize: 12,
        marginVertical: 5,
    },
    loginBtn: {
    },
    remember: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    }
});