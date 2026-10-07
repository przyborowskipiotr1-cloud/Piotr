// Gmail MCP Integration
// This module provides functions to fetch Gmail data via Claude's MCP
// Usage: Call fetchGmailViaMCP() to get unread emails and save to tasks.json

const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Mock function - will be called from Claude session with actual MCP results
async function saveEmailsAsTasksFromMCP(emails) {
  try {
    const existingTasks = await loadTasks();
    const existingIds = new Set(existingTasks.map(t => t.id));

    const newTasks = emails
      .filter(email => !existingIds.has(email.id))
      .map((email) => {
        // Assign quadrant based on sender and content
        let quadrant = 'not-urgent-not-important'; // default

        const text = `${email.subject}`.toLowerCase();
        const urgentKeywords = ['urgent', 'asap', 'critical', 'approval', 'decision'];
        const importantKeywords = ['strategic', 'decision', 'planning', 'review', 'proposal'];

        const isUrgent = urgentKeywords.some(kw => text.includes(kw));
        const isImportant = importantKeywords.some(kw => text.includes(kw));

        if (isUrgent && isImportant) quadrant = 'urgent-important';
        else if (!isUrgent && isImportant) quadrant = 'not-urgent-important';
        else if (isUrgent && !isImportant) quadrant = 'urgent-not-important';

        return {
          id: email.id,
          title: email.subject,
          description: email.snippet || '',
          from: email.from,
          link: email.link,
          source: 'gmail-mcp',
          quadrant: quadrant,
          priority: isUrgent ? 'high' : 'medium',
          createdAt: new Date(email.receivedDateTime).toISOString(),
          dueDate: null,
          completed: false
        };
      });

    if (newTasks.length > 0) {
      const allTasks = [...existingTasks, ...newTasks];
      await fs.writeFile(DATA_FILE, JSON.stringify(allTasks, null, 2));
      console.log(`✅ Synced ${newTasks.length} new emails from Gmail MCP`);
      return { added: newTasks.length, total: allTasks.length };
    } else {
      console.log('No new emails to sync');
      return { added: 0, total: existingTasks.length };
    }
  } catch (error) {
    console.error('Error saving emails:', error.message);
    throw error;
  }
}

async function loadTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Export for use from Claude session
module.exports = {
  saveEmailsAsTasksFromMCP,
  loadTasks
};

// If called directly as script
if (require.main === module) {
  console.log('📧 Gmail MCP Integration Module');
  console.log('Use: require("./gmailMCP").saveEmailsAsTasksFromMCP(emails)');
}
