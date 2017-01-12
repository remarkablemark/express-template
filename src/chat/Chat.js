'use strict';

/**
 * Module dependencies.
 */
import React from 'react';

// components
import Sidebar from '../sidebar/Sidebar';
import MessageList from '../messages/MessageList';
import Form from './Form';

// styles
import { sidebarWidth } from '../shared/styles';
const styles = {
    container: {
        height: '100%'
    },
    content: {
        position: 'relative',
        marginLeft: sidebarWidth,
        height: '100%'
    }
};

/**
 * Chat component.
 */
export default function Chat(props) {
    const {
        activeRoom,
        rooms,
        sidebar,
        users
    } = props;

    return (
        <div style={styles.container}>
            <Sidebar
                activeRoom={activeRoom}
                rooms={rooms}
                sidebar={sidebar}
                users={users}
            />
            <div style={styles.content}>
                <MessageList />
                <Form />
            </div>
        </div>
    );
}

Chat.propTypes = {
    activeRoom: React.PropTypes.string,
    rooms: React.PropTypes.object,
    sidebar: React.PropTypes.shape({
        channels: React.PropTypes.array,
        directMessages: React.PropTypes.array
    }),
    users: React.PropTypes.object
};
