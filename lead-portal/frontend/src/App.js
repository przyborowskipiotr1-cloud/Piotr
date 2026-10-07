import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import TaskCard from './components/TaskCard';
import AllTasksTab from './components/AllTasksTab';
import SettingsTab from './components/SettingsTab';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Rules engine for task assignment
const assignTaskQuadrant = (task, rules = {}) => {
  const text = `${task.title} ${task.description}`.toLowerCase();

  const urgentKeywords = ['urgent', 'asap', 'critical', 'approval needed', 'decision needed', 'escalation'];
  const importantKeywords = ['strategic', 'decision', 'planning', 'review', 'proposal', 'approval'];

  const isUrgent = urgentKeywords.some(kw => text.includes(kw)) || task.priority === 'high';
  const isImportant = importantKeywords.some(kw => text.includes(kw)) || (task.from && text.includes('team lead')) || (task.from && text.includes('director'));

  if (isUrgent && isImportant) return 'urgent-important';
  if (!isUrgent && isImportant) return 'not-urgent-important';
  if (isUrgent && !isImportant) return 'urgent-not-important';
  return 'not-urgent-not-important';
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeTab, setActiveTab] = useState('matrix');
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', quadrant: null });
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (taskList) => {
    setStats({
      total: taskList.length,
      completed: taskList.filter(t => t.completed).length
    });
  };

  const refreshTasks = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/tasks/refresh`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const quadrantMap = {
      'quadrant-1': 'urgent-important',
      'quadrant-2': 'not-urgent-important',
      'quadrant-3': 'urgent-not-important',
      'quadrant-4': 'not-urgent-not-important'
    };

    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, {
        quadrant: quadrantMap[destination.droppableId]
      });

      const updatedTasks = tasks.map(t =>
        t.id === task.id ? { ...t, quadrant: quadrantMap[destination.droppableId] } : t
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const quadrant = newTask.quadrant || assignTaskQuadrant(newTask);
      const response = await axios.post(`${API_URL}/tasks`, {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate || null,
        source: 'manual',
        quadrant: quadrant
      });

      setTasks([...tasks, response.data]);
      setNewTask({ title: '', description: '', dueDate: '', quadrant: null });
      setShowAddTask(false);
      updateStats([...tasks, response.data]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      updateStats(updated);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCompleteTask = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}`, { completed: !completed });
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !completed } : t);
      setTasks(updated);
      updateStats(updated);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getTasksByQuadrant = (quadrant) => {
    return tasks.filter(t => t.quadrant === quadrant && !t.completed);
  };

  const quadrants = [
    { id: 'quadrant-1', title: 'Do First', subtitle: 'Urgent & Important', quadrant: 'urgent-important', color: 'red' },
    { id: 'quadrant-2', title: 'Schedule', subtitle: 'Not Urgent & Important', quadrant: 'not-urgent-important', color: 'blue' },
    { id: 'quadrant-3', title: 'Delegate', subtitle: 'Urgent & Not Important', quadrant: 'urgent-not-important', color: 'orange' },
    { id: 'quadrant-4', title: 'Eliminate', subtitle: 'Not Urgent & Not Important', quadrant: 'not-urgent-not-important', color: 'gray' }
  ];

  const allTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Lead Portal</h1>
        <div className="header-actions">
          <button onClick={refreshTasks} disabled={loading} className="btn btn-primary">
            {loading ? 'Loading...' : '🔄 Refresh Gmail'}
          </button>
          <button onClick={() => setShowAddTask(!showAddTask)} className="btn btn-secondary">
            ➕ Add Task
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          📊 Matrix
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📋 All Tasks
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Active: {allTasks.length}</span>
        <span>Completed: {completedTasks.length}</span>
      </div>

      {showAddTask && (
        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <div className="form-group">
            <label>Assign to Quadrant (optional - auto-assigned if blank)</label>
            <select
              value={newTask.quadrant || ''}
              onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value || null })}
            >
              <option value="">Auto-assign based on keywords</option>
              <option value="urgent-important">Do First - Urgent & Important</option>
              <option value="not-urgent-important">Schedule - Not Urgent & Important</option>
              <option value="urgent-not-important">Delegate - Urgent & Not Important</option>
              <option value="not-urgent-not-important">Eliminate - Not Urgent & Not Important</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">Add</button>
            <button type="button" onClick={() => setShowAddTask(false)} className="btn btn-cancel">Cancel</button>
          </div>
        </form>
      )}

      {activeTab === 'matrix' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="matrix-container">
            {quadrants.map((quadrant) => (
              <Droppable key={quadrant.id} droppableId={quadrant.id}>
                {(provided, snapshot) => (
                  <div
                    className={`quadrant quadrant-${quadrant.color}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : '' }}
                  >
                    <h2>{quadrant.title}</h2>
                    <p className="quadrant-subtitle">{quadrant.subtitle}</p>
                    <div className="tasks-list">
                      {getTasksByQuadrant(quadrant.quadrant).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.5 : 1
                              }}
                            >
                              <TaskCard
                                task={task}
                                onDelete={() => handleDeleteTask(task.id)}
                                onComplete={() => handleCompleteTask(task.id, task.completed)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {activeTab === 'all' && (
        <AllTasksTab
          tasks={allTasks}
          completedTasks={completedTasks}
          onDelete={handleDeleteTask}
          onComplete={handleCompleteTask}
          quadrants={quadrants}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          gmailConnected={gmailConnected}
          setGmailConnected={setGmailConnected}
        />
      )}
    </div>
  );
}

export default App;
