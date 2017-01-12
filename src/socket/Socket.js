'use strict';

/**
 * Module dependencies.
 */
import React from 'react';
import { browserHistory } from 'react-router';
import _ from 'lodash';

// components
import Chat from '../chat/Chat';

// redux
import { connect } from 'react-redux';
import {
    removeAll,
    setRooms,
    setSocket,
    setUser,
    setUsers,
    updateMessages
} from '../actions';

// socket events
import {
    MESSAGES,
    ROOMS,
    USER,
    USERS
} from '../../socket.io/events';

/**
 * Socket component.
 */
class Socket extends React.Component {
    /**
     * Connect to socket and listen to socket events.
     */
    componentDidMount() {
        window.requirejs(['io'], (io) => {
            const {
                removeAll,
                setRooms,
                setUser,
                setUsers,
                setSocket,
                updateMessages
            } = this.props;

            const socket = io.connect();
            setSocket(socket);
            this.socket = socket;
            this.events = [];

            /**
             * Set `user` when client connects.
             */
            socket.on(USER, (user) => {
                // disconnect user if unauthenticated
                if (user.isAuthenticated === false) {
                    removeAll();
                    return browserHistory.push('/signin');
                }
                setUser(user);
            });
            this.events.push(USER);

            /**
             * Update `users` when user connects or disconnects.
             */
            socket.on(USERS, (users) => {
                setUsers(users);
            });
            this.events.push(USERS);

            /**
             * Set `rooms` joined by user.
             */
            socket.on(ROOMS, (rooms) => {
                setRooms(rooms);
            });
            this.events.push(ROOMS);

            /**
             * Listen for chat messages.
             */
            socket.on(MESSAGES, (messages) => {
                const roomId = _.get(messages, '[0]._room');
                if (roomId) updateMessages(roomId, messages);
            });
            this.events.push(MESSAGES);
        });
    }

    /**
     * Remove event listeners and disconnect from socket.
     * This will prevent memory leaks.
     */
    componentWillUnmount() {
        _.forEach(this.events, (eventName) => {
            this.socket.off(eventName);
        });
        this.socket.disconnect();
    }

    render() {
        return <Chat />;
    }
}

Socket.propTypes = {
    removeAll: React.PropTypes.func,
    setRooms: React.PropTypes.func,
    setSocket: React.PropTypes.func,
    setUser: React.PropTypes.func,
    setUsers: React.PropTypes.func,
    updateMessages: React.PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        removeAll: () => {
            dispatch(removeAll());
        },
        setRooms: (rooms) => {
            dispatch(setRooms(rooms));
        },
        setSocket: (socket) => {
            dispatch(setSocket(socket));
        },
        setUser: (user) => {
            dispatch(setUser(user));
        },
        setUsers: (users) => {
            dispatch(setUsers(users));
        },
        updateMessages: (room, messages) => {
            dispatch(updateMessages(room, messages));
        }
    };
}

export default connect(
    null,
    mapDispatchToProps
)(Socket);
