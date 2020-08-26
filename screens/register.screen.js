import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { globalStyles, colors } from '../styles/style';
import Toast from 'react-native-simple-toast';
import { env } from '../env';

export const RegisterScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [valid, setValid] = useState(false);

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
        } else if(!slug) {
            isValid = false;
            setError('slug required');
        }

        setValid(isValid);
    }

    const register = async () => {
        setIsLoading(true);
        setError('');

        const response = await fetch(`${env.apiUrl}/account/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, slug })
            });

        const json = await response.json();
        
        if(!response.ok){
            let msg = json.message;
            if(json.errors) msg = `${msg}: ${json.errors.join(". ")}`;
            setError(msg);
        } else {
            Toast.show('Registered! Please log in.', Toast.LONG);
            navigation.navigate('Login');
        }

        setIsLoading(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.registerContainer}>
                <Text style={styles.title}>Register</Text>
                <TextInput
                    placeholder="Enter email"
                    style={styles.input}
                    onChangeText={value => {setEmail(value); check();}}
                />
                <TextInput
                    placeholder="Enter slug"
                    style={styles.input}
                    onChangeText={value => {setSlug(value); check();}}
                />
                <TextInput
                    textContentType="password"
                    placeholder="Enter password"
                    style={styles.input}
                    onChangeText={value => {setPassword(value); check();}}
                />
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Button 
                    title="Register"
                    style={styles.registerBtn}
                    disabled={isLoading || !valid}
                    onPress={register}
                />
                <View style={globalStyles.separatorWide} />
                <Text 
                    style={globalStyles.link}
                    onPress={() => navigation.navigate('Login')}
                >Already a member? Login</Text>
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
    registerContainer: {
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
    registerBtn: {
    },
});