import React from 'react';
import { useTasks } from '../contexts/TaskContext';

const CompletedList: React.FC = () => {
  const { tasks, toggleTask } = useTasks();
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <section className="completed-tasks">
      <h2 className="section-title">完了済み</h2>
      {completedTasks.map(task => (
        <div 
          key={task.id} 
          className="completed-task-item"
          onClick={() => toggleTask(task.id)}
        >
          <div className="task-title">{task.title}</div>
        </div>
      ))}
    </section>
  );
};

export default CompletedList; 