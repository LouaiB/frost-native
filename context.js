import React, { Component } from 'react';

// Context
export const UserContext = React.createContext();

export class UserProvider extends Component {
  state = {
    email: '',
    userId: '',
    isLoggedIn: false,
    nickname: null,
    avatar: null,
    slug: '',
    mentions: []
  }

  render() {
    return (
      <UserContext.Provider value={{
        state: this.state,
        setUser: user => {
          this.setState({
            ...this.state,
            email: user.email,
            userId: user.userId,
            isLoggedIn: true,
            nickname: user.nickname,
            avatar: user.avatar,
            slug: user.slug,
            mentions: user.mentions
          })
        }
      }}>
        {this.props.children}
      </UserContext.Provider>
    )
  }
}