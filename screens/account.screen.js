import React, { useContext } from 'react';
import { StyleSheet  } from 'react-native';
import { UserContext, UserProvider } from '../context';
import { UserComponent } from '../components/user.component';

export const AccountScreen = ({ route, navigation }) => {

    const context = useContext(UserContext);

    const openAccount = accountId => {
        navigation.push("Account", { accountId });
    }
    
    return (
        <UserComponent accountId={route.params.accountId} openAccount={openAccount} />
    )
}

const styles = StyleSheet.create({
    
});