import React, { Component } from 'react';
import TaskList from './TaskList';
import Notifications from './Notifications';
import { collect, WithStoreProp } from '../../../src';

interface Props extends WithStoreProp {
  onAppUpdate: () => {};
  onTaskListUpdate: () => {};
  onNotificationsUpdate: () => {};
}

class App extends Component<Props> {
  componentDidUpdate() {
    this.props.onAppUpdate();
  }

  render() {
    return (
      <div>
        <header>{this.props.store.site.title}</header>

        <TaskList onTaskListUpdate={this.props.onTaskListUpdate} />

        <Notifications
          onNotificationsUpdate={this.props.onNotificationsUpdate}
        />
      </div>
    );
  }
}

export default collect(App);
