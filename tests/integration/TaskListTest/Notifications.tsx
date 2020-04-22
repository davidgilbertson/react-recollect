import React, { Component } from 'react';
import { collect, WithStoreProp } from '../../..';

type Props = WithStoreProp & {
  onNotificationsUpdate?: () => void;
};

class Notifications extends Component<Props> {
  componentDidUpdate() {
    if (this.props.onNotificationsUpdate) {
      this.props.onNotificationsUpdate();
    }
  }

  render() {
    const { store } = this.props;

    return (
      <div>
        {store.notifications.map((notification: string) => (
          <p key={notification}>{notification}</p>
        ))}
      </div>
    );
  }
}

export default collect(Notifications);
