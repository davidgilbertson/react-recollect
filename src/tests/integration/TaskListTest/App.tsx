import React, { Component } from 'react';
import { collect } from 'src';
import TaskList from 'src/tests/integration/TaskListTest/TaskList';
import Notifications from 'src/tests/integration/TaskListTest/Notifications';
import { WithStoreProp } from '../../../../index.d';

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
