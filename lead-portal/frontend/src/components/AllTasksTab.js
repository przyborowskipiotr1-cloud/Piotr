import React, { useState } from 'react';
import TaskCard from './TaskCard';
import '../styles/AllTasksTab.css';

function AllTasksTab({ tasks, completedTasks, onDelete, onComplete, quadrants }) {
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterQuadrant, setFilterQuadrant] = useState('all');

  const getQuadrantName = (quadrant) => {
    const q = quadrants.find(qd => qd.quadrant === quadrant);
    return q ? q.title : quadrant;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityMap = { high: 1, medium: 2, low: 3 };
      return (priorityMap[a.priority] || 3) - (priorityMap[b.priority] || 3);
    }
    if (sortBy === 'source') {
      return (a.source || '').localeCompare(b.source || '');
    }
    return 0;
  });

  const filteredTasks = filterQuadrant === 'all'
    ? sortedTasks
    : sortedTasks.filter(t => t.quadrant === filterQuadrant);

  return (
    <div className="all-tasks-tab">
      <div className="controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="source">Source</option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter by Quadrant:</label>
          <select value={filterQuadrant} onChange={(e) => setFilterQuadrant(e.target.value)}>
            <option value="all">All Quadrants</option>
            {quadrants.map(q => (
              <option key={q.quadrant} value={q.quadrant}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tasks-container">
        <div className="section">
          <h3>Active Tasks ({filteredTasks.length})</h3>
          {filteredTasks.length === 0 ? (
            <p className="empty-state">No active tasks</p>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div key={task.id} className="task-item-wrapper">
                  <div className="task-meta-info">
                    <span className={`quadrant-badge quadrant-${quadrants.find(q => q.quadrant === task.quadrant)?.color}`}>
                      {getQuadrantName(task.quadrant)}
                    </span>
                  </div>
                  <TaskCard
                    task={task}
                    onDelete={() => onDelete(task.id)}
                    onComplete={() => onComplete(task.id, task.completed)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h3>Completed Tasks ({completedTasks.length})</h3>
          {completedTasks.length === 0 ? (
            <p className="empty-state">No completed tasks</p>
          ) : (
            <div className="task-list">
              {completedTasks.map((task) => (
                <div key={task.id} className="task-item-wrapper">
                  <div className="task-meta-info">
                    <span className={`quadrant-badge quadrant-${quadrants.find(q => q.quadrant === task.quadrant)?.color}`}>
                      {getQuadrantName(task.quadrant)}
                    </span>
                  </div>
                  <TaskCard
                    task={task}
                    onDelete={() => onDelete(task.id)}
                    onComplete={() => onComplete(task.id, task.completed)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllTasksTab;
