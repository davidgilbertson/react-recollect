import React, { Component } from 'react';
import { collect } from 'src';
import { WithStoreProp } from '../../../../index.d';

interface Props extends WithStoreProp {
  onNotificationsUpdate: () => {};
}

class Notifications extends Component<Props> {
  componentDidUpdate() {
    this.props.onNotificationsUpdate();
  }

  render() {
    const { store } = this.props;

    return (
      <div>
        {store.notifications.map((notification) => (
          <p key={notification}>{notification}</p>
        ))}
      </div>
    );
  }
}

export default collect(Notifications);
