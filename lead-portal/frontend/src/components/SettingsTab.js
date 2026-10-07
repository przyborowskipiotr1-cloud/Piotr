import React, { useState } from 'react';
import '../styles/SettingsTab.css';

function SettingsTab({ gmailConnected, setGmailConnected }) {
  const [activeSection, setActiveSection] = useState('gmail');
  const [rules, setRules] = useState({
    urgentKeywords: ['urgent', 'asap', 'critical', 'approval needed', 'decision needed'],
    importantKeywords: ['strategic', 'decision', 'planning', 'review', 'proposal'],
    autoAssign: true
  });

  const handleGmailConnect = () => {
    // In real app, this would open OAuth flow
    alert('Gmail OAuth flow would open here. Currently requires .env setup.');
  };

  const handleAddKeyword = (type) => {
    const newKeyword = prompt(`Add new ${type} keyword:`);
    if (newKeyword) {
      setRules({
        ...rules,
        [type]: [...rules[type], newKeyword.toLowerCase()]
      });
    }
  };

  const handleRemoveKeyword = (type, keyword) => {
    setRules({
      ...rules,
      [type]: rules[type].filter(kw => kw !== keyword)
    });
  };

  const quadrantConfig = [
    {
      name: 'Do First',
      shortName: 'urgent-important',
      description: 'Urgent & Important - Tasks requiring immediate attention and strategic value',
      examples: ['Urgent emails from CEO', 'Critical decisions', 'Fire-fighting issues']
    },
    {
      name: 'Schedule',
      shortName: 'not-urgent-important',
      description: 'Not Urgent & Important - Strategic work for future',
      examples: ['Planning tasks', 'Strategic reviews', 'Process improvements']
    },
    {
      name: 'Delegate',
      shortName: 'urgent-not-important',
      description: 'Urgent & Not Important - Can be delegated or automated',
      examples: ['Status requests', 'Routine approvals', 'Quick replies needed']
    },
    {
      name: 'Eliminate',
      shortName: 'not-urgent-not-important',
      description: 'Not Urgent & Not Important - Can be ignored or deleted',
      examples: ['FYI emails', 'Newsletters', 'Low-priority notifications']
    }
  ];

  return (
    <div className="settings-tab">
      <div className="settings-nav">
        <button
          className={`settings-nav-item ${activeSection === 'gmail' ? 'active' : ''}`}
          onClick={() => setActiveSection('gmail')}
        >
          Gmail Integration
        </button>
        <button
          className={`settings-nav-item ${activeSection === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveSection('rules')}
        >
          Assignment Rules
        </button>
        <button
          className={`settings-nav-item ${activeSection === 'quadrants' ? 'active' : ''}`}
          onClick={() => setActiveSection('quadrants')}
        >
          Quadrant Guide
        </button>
      </div>

      <div className="settings-content">
        {activeSection === 'gmail' && (
          <div className="settings-section">
            <h2>📧 Gmail Integration</h2>

            <div className="setting-card">
              <h3>Connection Status</h3>
              <div className={`status ${gmailConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {gmailConnected ? 'Connected' : 'Not Connected'}
              </div>
            </div>

            <div className="setting-card">
              <h3>Setup Instructions</h3>
              <ol className="instructions">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                <li>Create a new project or select existing one</li>
                <li>Search for "Gmail API" and enable it</li>
                <li>Go to Credentials → Create OAuth2 Web Application</li>
                <li>Add redirect URI: <code>http://localhost:3001/auth/callback</code></li>
                <li>Copy Client ID & Secret to backend <code>.env</code> file</li>
                <li>Restart the backend server</li>
              </ol>
            </div>

            <div className="setting-card">
              <h3>Auto-Refresh Settings</h3>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Auto-sync Gmail emails daily at 9 AM
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Only fetch unread emails
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Notify on new urgent tasks
                </label>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="settings-section">
            <h2>🎯 Task Assignment Rules</h2>

            <div className="setting-card">
              <h3>How Tasks Are Assigned</h3>
              <p>When you create a new task, it's automatically assigned to a quadrant based on keywords and content:</p>
            </div>

            <div className="setting-card">
              <h3>Urgent Keywords</h3>
              <p className="description">Tasks containing these words are marked as URGENT</p>
              <div className="keywords">
                {rules.urgentKeywords.map(kw => (
                  <span key={kw} className="keyword">
                    {kw}
                    <button onClick={() => handleRemoveKeyword('urgentKeywords', kw)}>×</button>
                  </span>
                ))}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleAddKeyword('urgentKeywords')}
              >
                + Add Keyword
              </button>
            </div>

            <div className="setting-card">
              <h3>Important Keywords</h3>
              <p className="description">Tasks containing these words are marked as IMPORTANT</p>
              <div className="keywords">
                {rules.importantKeywords.map(kw => (
                  <span key={kw} className="keyword">
                    {kw}
                    <button onClick={() => handleRemoveKeyword('importantKeywords', kw)}>×</button>
                  </span>
                ))}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleAddKeyword('importantKeywords')}
              >
                + Add Keyword
              </button>
            </div>

            <div className="setting-card">
              <h3>Auto-Assignment</h3>
              <label>
                <input
                  type="checkbox"
                  checked={rules.autoAssign}
                  onChange={(e) => setRules({...rules, autoAssign: e.target.checked})}
                />
                Auto-assign new tasks (can override manually)
              </label>
            </div>
          </div>
        )}

        {activeSection === 'quadrants' && (
          <div className="settings-section">
            <h2>📊 Eisenhower Matrix Guide</h2>
            <p className="intro">Each quadrant helps you prioritize work based on urgency and importance:</p>

            <div className="quadrants-grid">
              {quadrantConfig.map((quad, idx) => (
                <div key={idx} className={`quadrant-info quadrant-${['red', 'blue', 'orange', 'gray'][idx]}`}>
                  <h3>{quad.name}</h3>
                  <p className="description">{quad.description}</p>
                  <div className="examples">
                    <strong>Examples:</strong>
                    <ul>
                      {quad.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="tips">
              <h3>💡 Management Tips</h3>
              <ul>
                <li><strong>Do First:</strong> Handle these today. Block time for focused work.</li>
                <li><strong>Schedule:</strong> Plan these in your calendar. These drive long-term success.</li>
                <li><strong>Delegate:</strong> Assign to team members. Reduces your load significantly.</li>
                <li><strong>Eliminate:</strong> Delete or skip. Reclaim hours each week by saying no.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsTab;
