/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { collect } from 'src';

class Notifications extends Component {
  componentDidUpdate() {
    this.props.onNotificationsUpdate();
  }

  render() {
    const { store } = this.props;

    return (
      <div>
        {store.notifications.map(notification => (
          <p key={notification}>{notification}</p>
        ))}
      </div>
    );
  }
}

export default collect(Notifications);
