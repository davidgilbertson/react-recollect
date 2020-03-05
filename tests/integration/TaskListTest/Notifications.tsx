import React, { Component } from 'react';
import { collect, WithStoreProp } from '../../../src';

type Props = WithStoreProp & {
  onNotificationsUpdate: () => {};
};

class Notifications extends Component<Props> {
  componentDidUpdate() {
    this.props.onNotificationsUpdate();
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
