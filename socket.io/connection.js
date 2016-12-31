'use strict';

/**
 * Module dependencies.
 */
const debug = require('debug')(process.env.APP_NAME + ':socket');
const ObjectId = require('mongoose').Types.ObjectId;
const Message = require('../models/message');
const {
    CHAT_MESSAGE,
    USER_DATA,
    USERS
} = require('./events');

/**
 * Handle client 'connection' event.
 *
 * @param {Object} io     - The io.
 * @param {Object} socket - The socket.
 */
function onConnection(io, socket) {
    const { request } = socket;
    debug('client connected', request.session);

    // force client to disconnect if unauthenticated
    if (!request.session.isAuthenticated) {
        return socket.emit(USER_DATA, {
            isAuthenticated: false
        });
    }

    // save user id on socket
    socket.userId = request.session._id;
    socket.username = request.session.username;

    // send client object of connected users
    let connectedUsers = {};
    Object.keys(io.sockets.connected).map(socketId => {
        const socket = io.sockets.connected[socketId];
        connectedUsers[socket.userId] = {
            username: socket.username,
            isConnected: true
        };
    });
    socket.emit(USERS, connectedUsers);

    // broadcast to other clients that user has connected
    socket.broadcast.emit(USERS, {
        [socket.userId]: {
            username: socket.username,
            isConnected: true
        }
    });

    // chat message
    socket.on(CHAT_MESSAGE, (chatMessage) => {
        chatMessage._id = ObjectId();
        io.emit(CHAT_MESSAGE, chatMessage);
        const message = new Message(chatMessage);
        message.save((error) => {
            if (error) debug('failed to save message', error);
        });
        debug(CHAT_MESSAGE, chatMessage);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit(USERS, {
            [socket.userId]: {
                isConnected: false
            }
        });
        Object.keys(socket._events).forEach(eventName => {
            socket.removeAllListeners(eventName);
        });
        debug('client disconnected', request.session);
    });
}

module.exports = onConnection;
