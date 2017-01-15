'use strict';

/**
 * Module dependencies.
 */
const debug = require('../db/helpers').debug;
const { docsToObj } = require('./helpers');

// models
const Message = require('../models/message');
const Room = require('../models/room');
const User = require('../models/user');

// constants
const {
    MESSAGES,
    ROOMS,
    USER,
    USERS
} = require('./events');

const userProjection = {
    name: 1,
    rooms: 1,
    username: 1
};
const messagesProjection = { __v: 0, _room: 0 };
const messagesOptions = {
    limit: require('../config/constants').messagesLimit,
    sort: { created: -1 }
};
const roomsProjection = { _users: 1, name: 1 };
const emptyQuery = {};
const usersProjection = { username: 1 };

/**
 * Initial actions when client connects.
 *
 * @param {Object} io     - The io.
 * @param {Object} socket - The socket.
 */
function connect(io, socket) {
    const { userId } = socket;

    // broadcast to other clients that user has connected
    socket.broadcast.emit(USERS, {
        [userId]: {
            username: socket.username,
            isConnected: true
        }
    });

    /**
     * Find user.
     */
    User.findById(userId, userProjection, (err, user) => {
        if (err) return debug('unable to find user', err);

        // user not found
        if (!user) return socket.emit(USER, { isAuthenticated: false });

        // send client user data
        socket.emit(USER, Object.assign(user.toObject(), {
            isAuthenticated: true
        }));

        const userRooms = user.rooms;
        const activeRoom = userRooms.active;

        /**
         * Find messages.
         */
        Message.find({
            _room: activeRoom
        }, messagesProjection, messagesOptions, (err, messages) => {
            if (err) return debug('unable to find messages', err);

            // no messages found
            if (!messages) return socket.emit(MESSAGES, activeRoom, []);

            // send client latest messages
            socket.emit(MESSAGES, activeRoom, messages.reverse());
        });

        const sidebarRooms = userRooms.sidebar;

        /**
         * Find rooms (shown in sidebar).
         */
        Room.find({
            _id: {
                $in: sidebarRooms.channels.concat(
                    sidebarRooms.directMessages
                )
            }
        }, roomsProjection, (err, rooms) => {
            if (err || !rooms) return debug('unable to find rooms', err);

            // send client sidebar rooms data
            socket.emit(ROOMS, docsToObj(rooms));
            debug(ROOMS, rooms);
        });
    });

    /**
     * Find all users.
     */
    User.find(emptyQuery, usersProjection, (err, users) => {
        if (err || !users) return debug('no users found', err);

        // mark connected user
        let usersData = docsToObj(users);
        Object.keys(io.sockets.connected).map((socketId) => {
            usersData[io.sockets.connected[socketId].userId].isConnected = true;
        });

        // send client data of all users
        socket.emit(USERS, usersData);
    });
}

module.exports = connect;
