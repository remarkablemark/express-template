'use strict';

/**
 * Module dependencies.
 */
import React from 'react';
import _ from 'lodash';
import LeftNav from './LeftNav';
import MessageList from './MessageList';
import Form from './Form';

// styles
import { leftNavWidth } from './styles';
const styles = {
    container: {
        height: '100%'
    },
    content: {
        position: 'relative',
        marginLeft: leftNavWidth,
        height: '100%'
    }
};

/**
 * Chat component.
 */
export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: 0,
            messages: props.messages
        };
    }

    componentDidMount() {
        window.requirejs(['superagent'], (request) => {
            request.get('/api/messages', (error, response) => {
                if (error || !response.ok) {
                    return console.log(error, response); // eslint-disable-line no-console
                }
                this.setState({
                    messages: response.body,
                    isLoaded: this.state.isLoaded + 1
                });
            });

            request.get('/api/users', (error, response) => {
                if (error || !response.ok) {
                    return console.log(error, response); // eslint-disable-line no-console
                }

                // reformat collection into hash
                const users = {};
                _.forEach(response.body, (user) => {
                    const { _id, username } = user;
                    users[_id] = {
                        username
                    };
                });

                this.setState({
                    users,
                    isLoaded: this.state.isLoaded + 1
                });
            });
        });
    }

    render() {
        const { isLoaded, messages, users } = this.state;
        if (isLoaded < 2) return null;

        return (
            <div style={styles.container}>
                <LeftNav users={users} />
                <div style={styles.content}>
                    <MessageList messages={messages} users={users} />
                    <Form />
                </div>
            </div>
        );
    }
}

Chat.propTypes = {
    messages: React.PropTypes.array,
    users: React.PropTypes.object
};

Chat.defaultProps = {
    messages: [],
    users: {}
};
