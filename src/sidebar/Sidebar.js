'use strict';

/**
 * Module dependencies.
 */
import React from 'react';
import _ from 'lodash';

// components
import Drawer from 'material-ui/Drawer';
import SidebarMenu from './SidebarMenu';

// redux
import { connect } from 'react-redux';
import { setUser } from '../actions';

// constants
import { sidebarWidth } from '../shared/styles';
import {
    CHANNELS_TYPE,
    DIRECT_MESSAGES_TYPE
} from './helpers';
import { defaultRoom } from '../../config/constants';

/**
 * Sidebar component.
 */
function Sidebar(props) {
    const {
        activeRoomId,
        rooms,
        setUser,
        sidebar,
        socket,
        userId,
        users
    } = props;

    if (!activeRoomId || _.isEmpty(rooms)) return null;

    return (
        <Drawer open={true} width={sidebarWidth}>
            {/* channels */}
            <SidebarMenu
                activeRoomId={activeRoomId}
                roomIds={sidebar[CHANNELS_TYPE]}
                roomPrefix='# '
                rooms={rooms}
                setUser={setUser}
                socket={socket}
                title='CHANNELS'
                type={CHANNELS_TYPE}
                userId={userId}
            />

            {/* direct messages */}
            <SidebarMenu
                activeRoomId={activeRoomId}
                roomIds={sidebar[DIRECT_MESSAGES_TYPE]}
                rooms={rooms}
                setUser={setUser}
                socket={socket}
                title='DIRECT MESSAGES'
                type={DIRECT_MESSAGES_TYPE}
                userId={userId}
                users={users}
            />
        </Drawer>
    );
}

Sidebar.propTypes = {
    activeRoomId: React.PropTypes.string,
    rooms: React.PropTypes.object,
    setUser: React.PropTypes.func,
    sidebar: React.PropTypes.shape({
        channels: React.PropTypes.array,
        directMessages: React.PropTypes.array
    }),
    socket: React.PropTypes.object,
    userId: React.PropTypes.string,
    users: React.PropTypes.object
};

Sidebar.defaultProps = {
    sidebar: {
        channels: [defaultRoom],
        directMessages: []
    }
};

function mapStateToProps(state) {
    const { rooms, socket, user, users } = state;
    const activeRoomId = _.get(user, 'rooms.active');
    const sidebar = _.get(user, 'rooms.sidebar');
    return {
        activeRoomId,
        rooms,
        sidebar,
        socket,
        userId: user._id,
        users
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setUser: (user) => {
            dispatch(setUser(user));
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);
