import React from 'react';
import '../styles/TaskCard.css';

function TaskCard({ task, onDelete, onComplete }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onComplete}
          className="task-checkbox"
        />
        <h3 className="task-title">{task.title}</h3>
        <button onClick={onDelete} className="btn-delete">✕</button>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      {task.dueDate && (
        <div className="task-meta">
          📅 {formatDate(task.dueDate)}
        </div>
      )}

      {task.from && (
        <div className="task-meta">
          📧 {task.from.substring(0, 40)}
        </div>
      )}

      {task.link && (
        <a href={task.link} target="_blank" rel="noopener noreferrer" className="task-link">
          Open in {task.source === 'gmail' ? 'Gmail' : 'Portal'} →
        </a>
      )}

      {task.source === 'gmail' && <span className="badge badge-gmail">Gmail</span>}
      {task.source === 'manual' && <span className="badge badge-manual">Manual</span>}
    </div>
  );
}

export default TaskCard;
