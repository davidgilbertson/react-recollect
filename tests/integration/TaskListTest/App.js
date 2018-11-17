import React, { Component } from 'react';
import { collect, store } from '../../../dist';
import TaskList from './TaskList';
import Notifications from './Notifications';

class App extends Component {
  componentDidUpdate() {
    this.props.onAppUpdate();
  }

  render() {
    return (
      <div>
        <header>
          {this.props.store.site.title}
        </header>

        <TaskList onTaskListUpdate={this.props.onTaskListUpdate}/>

        <Notifications onNotificationsUpdate={this.props.onNotificationsUpdate}/>
      </div>
    );
  }
}

export default collect(App);
