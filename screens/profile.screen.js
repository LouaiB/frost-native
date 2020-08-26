import React, { useContext } from 'react';
import { StyleSheet  } from 'react-native';
import { UserContext, UserProvider } from '../context';
import { UserComponent } from '../components/user.component';

export const ProfileScreen = ({ route, navigation }) => {

    const context = useContext(UserContext);

    const openAccount = accountId => {
        navigation.navigate("Account", { accountId })
    }
    
    return (
        <UserComponent accountId={context.state.userId} openAccount={openAccount} />
    )
}

const styles = StyleSheet.create({
    
});