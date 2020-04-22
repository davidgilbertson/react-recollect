import React, { Component } from 'react';
import TaskList from './TaskList';
import Notifications from './Notifications';
import { collect, WithStoreProp } from '../../..';

interface Props extends WithStoreProp {
  onAppUpdate?: () => void;
  onTaskListUpdate?: () => void;
  onNotificationsUpdate?: () => void;
}

class App extends Component<Props> {
  componentDidUpdate() {
    if (this.props.onAppUpdate) {
      this.props.onAppUpdate();
    }
  }

  render() {
    return (
      <div>
        {!!this.props.store.site && (
          <header>{this.props.store.site.title}</header>
        )}

        <TaskList onTaskListUpdate={this.props.onTaskListUpdate} />

        {!!this.props.store.notifications && (
          <Notifications
            onNotificationsUpdate={this.props.onNotificationsUpdate}
          />
        )}
      </div>
    );
  }
}

export default collect(App);
