'use strict';

/**
 * Module dependencies.
 */
const debug = {};
debug.db = require('../db/helpers').debug;
debug.socket = require('./helpers').debug;

// mongoose
const Room = require('../models/room');

// constants
const {
    CREATE_ROOM,
    ROOMS
}  = require('./events');

/**
 * Event listeners for rooms.
 *
 * @param {Object} io     - The io.
 * @param {Object} socket - The socket.
 */
function rooms(io, socket) {
    /**
     * Create new room.
     */
    socket.on(CREATE_ROOM, (data) => {
        // save to database
        new Room(data).save((error, room) => {
            if (error) debug.db('failed to save room', error);

            socket.emit(ROOMS, {
                [room._id]: {
                    name: room.name
                }
            });
            debug.socket(CREATE_ROOM, room);
        });
    });
}

module.exports = rooms;