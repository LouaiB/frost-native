import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React, { Component, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoginScreen } from './screens/login.screen';
import { RegisterScreen } from './screens/register.screen';
import { HomeScreen } from './screens/home.screen';
import { UserContext, UserProvider } from './context';
import { SearchTweetsScreen } from './screens/searchTweets.screen';
import { TweetScreen } from './screens/tweet.screen';
import { SearchUsersScreen } from './screens/searchUsers.screen';
import { AccountScreen } from './screens/account.screen';
import { ProfileScreen } from './screens/profile.screen';
import { FriendsScreen } from './screens/friends.screen';
import { FontAwesome5, AntDesign, FontAwesome } from '@expo/vector-icons';
import { colors } from './styles/style';

const MainStack = createStackNavigator();
const Tabs = createBottomTabNavigator();

const SearchTweetsStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="SearchTweets" component={SearchTweetsScreen} options={{title: "Search Tweets"}} />
      <MainStack.Screen name="Tweet" component={TweetScreen} options={{title: "Tweet"}} />
    </MainStack.Navigator>
  )
}

const SearchUsersStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="SearchUsers" component={SearchUsersScreen} options={{title: "Search Users"}} />
      <MainStack.Screen name="Account" component={AccountScreen} options={{title: "Account"}} />
    </MainStack.Navigator>
  )
}

const ProfileStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{title: "Profile"}} />
      <MainStack.Screen name="Account" component={AccountScreen} options={{title: "Account"}} />
    </MainStack.Navigator>
  )
}

const FriendsStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Friends" component={FriendsScreen} options={{title: "Friends"}} />
      <MainStack.Screen name="Account" component={AccountScreen} options={{title: "Account"}} />
    </MainStack.Navigator>
  )
}

const TabsScreen = () => {
  return (
  <Tabs.Navigator
    tabBarOptions={{
      activeTintColor: colors.successColor,
      inactiveTintColor: colors.primaryColorDark,
    }}
  >
    <Tabs.Screen
      name="Home"
      component={HomeScreen}
      options={
        {
          title: "Home",
          tabBarIcon: props => <FontAwesome5 name="home" style={props.focused ? styles.focusedTabIcon : styles.tabIcon } />
        }
      }
    />
    <Tabs.Screen 
      name="SearchTweets"
      component={SearchTweetsStackScreen}
      options={
        {
          title: "Search Tweets",
          tabBarIcon: props => <AntDesign name="twitter" style={props.focused ? styles.focusedTabIcon : styles.tabIcon } />
        }
      } 
    />
    <Tabs.Screen 
      name="SearchUsers"
      component={SearchUsersStackScreen}
      options={
        {
          title: "Search Users",
          tabBarIcon: props => <FontAwesome5 name="search" style={props.focused ? styles.focusedTabIcon : styles.tabIcon } />
        }
      } 
    />
    <Tabs.Screen 
      name="Profile"
      component={ProfileStackScreen}
      options={
        {
          title: "Profile",
          tabBarIcon: props => <FontAwesome name="user" style={props.focused ? styles.focusedTabIcon : styles.tabIcon } />
        }
      } 
    />
    <Tabs.Screen
      name="Friends"
      component={FriendsStackScreen}
      options={
        {
          title: "Friends",
          tabBarIcon: props => <FontAwesome5 name="user-friends" style={props.focused ? styles.focusedTabIcon : styles.tabIcon } />
        }
      }
    />
  </Tabs.Navigator>)
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <MainStack.Navigator>
          <MainStack.Screen name="Login" component={LoginScreen} />
          <MainStack.Screen name="Register" component={RegisterScreen} />
          <MainStack.Screen name="Main" component={TabsScreen} options={{title: "Frost"}} />
        </MainStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    color: colors.primaryColorDark,
  },
  focusedTabIcon: {
    color: colors.successColor,
  }
});
