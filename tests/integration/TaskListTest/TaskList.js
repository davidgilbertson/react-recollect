/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { collect } from '../../../src';
import Task from './Task';
import loadTasks from './loadTasks';

class TaskList extends Component {
  componentDidMount() {
    loadTasks();
  }

  componentDidUpdate() {
    if (this.props.onTaskListUpdate) {
      this.props.onTaskListUpdate();
    }
  }

  render() {
    const { store } = this.props;

    if (!store.tasks) return <h1>Loading...</h1>;

    return (
      <div>
        {store.tasks.length ? (
          store.tasks.map(task => <Task key={task.id} task={task} />)
        ) : (
          <h1>You have nothing to do</h1>
        )}
        <button
          onClick={() => {
            store.tasks.push({
              id: Math.random(),
              name: 'A new task',
              done: false,
            });
          }}
        >
          Add a task
        </button>

        <button
          onClick={() => {
            store.tasks.length = 0;
          }}
        >
          Delete all tasks
        </button>

        <button
          onClick={() => {
            delete store.tasks;
          }}
        >
          Delete task object
        </button>
      </div>
    );
  }
}

export default collect(TaskList);
