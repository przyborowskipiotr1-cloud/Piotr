const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Load tasks from file
async function loadTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Routes
app.get('/tasks', async (req, res) => {
  const tasks = await loadTasks();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const task = {
    id: Date.now().toString(),
    quadrant: 'not-urgent-not-important',
    completed: false,
    createdAt: new Date().toISOString(),
    source: 'manual',
    ...req.body
  };

  const tasks = await loadTasks();
  tasks.push(task);
  await saveTasks(tasks);

  res.json(task);
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  await saveTasks(tasks);

  res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  let tasks = await loadTasks();
  tasks = tasks.filter(t => t.id !== id);
  await saveTasks(tasks);

  res.json({ success: true });
});

app.post('/tasks/refresh/mcp', async (req, res) => {
  res.json({
    message: 'Gmail refresh via MCP',
    instructions: 'Call Claude to fetch Gmail emails and update tasks.json',
    endpoint: 'Use saveEmailsAsTasksFromMCP() in gmailMCP.js'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Lead Portal API running on http://localhost:${PORT}`);
  console.log(`📧 Gmail Integration: Use MCP from Claude session`);
  console.log(`   To refresh Gmail: Call Claude session to fetch emails`);
});
