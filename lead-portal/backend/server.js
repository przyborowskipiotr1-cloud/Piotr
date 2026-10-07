const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Gmail OAuth setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'http://localhost:3001/auth/callback'
);

let authToken = null;

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

// Gmail integration
async function getGmailEmails() {
  if (!authToken) return [];

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 20
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = msg.data.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      let snippet = msg.data.snippet || '';
      if (snippet.length > 100) snippet = snippet.substring(0, 100) + '...';

      emails.push({
        id: message.id,
        from,
        subject,
        snippet,
        date,
        source: 'gmail',
        link: `https://mail.google.com/mail/u/0/#inbox/${message.id}`
      });
    }

    return emails;
  } catch (error) {
    console.error('Gmail error:', error.message);
    return [];
  }
}

// Convert emails to tasks
async function emailsToTasks(emails) {
  const existingTasks = await loadTasks();
  const existingIds = new Set(existingTasks.map(t => t.id));

  const newTasks = emails
    .filter(email => !existingIds.has(email.id))
    .map((email, idx) => ({
      id: email.id,
      title: email.subject,
      description: email.snippet,
      from: email.from,
      link: email.link,
      source: 'gmail',
      quadrant: 'todo', // default: Important & Urgent
      priority: 'high',
      createdAt: new Date(email.date).toISOString(),
      dueDate: null,
      completed: false
    }));

  return newTasks;
}

// Routes
app.get('/auth/url', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly']
  });
  res.json({ authUrl });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    authToken = tokens;

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tasks', async (req, res) => {
  const tasks = await loadTasks();
  res.json(tasks);
});

app.post('/tasks/refresh', async (req, res) => {
  try {
    const emails = await getGmailEmails();
    const newTasks = await emailsToTasks(emails);
    const existingTasks = await loadTasks();

    const allTasks = [...existingTasks, ...newTasks];
    await saveTasks(allTasks);

    res.json({ added: newTasks.length, total: allTasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

app.post('/tasks', async (req, res) => {
  const task = {
    id: Date.now().toString(),
    quadrant: 'todo',
    completed: false,
    createdAt: new Date().toISOString(),
    ...req.body
  };

  const tasks = await loadTasks();
  tasks.push(task);
  await saveTasks(tasks);

  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Lead Portal API running on http://localhost:${PORT}`);
});
