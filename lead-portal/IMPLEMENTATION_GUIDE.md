# Lead Portal - Implementation Guide

## Overview

Lead Portal is a web-based task management system designed for managers. It aggregates information from multiple sources (starting with Gmail) and displays them in an Eisenhower Matrix for prioritization and decision-making.

## Architecture

```
Lead Portal
├── Backend (Node.js + Express)
│   ├── Gmail API Integration
│   ├── Task Management API
│   └── OAuth2 Authentication
└── Frontend (React)
    ├── Eisenhower Matrix (4 Quadrants)
    ├── Drag & Drop Interface
    └── Task Management UI
```

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Gmail account with API access
- Git

### 1. Clone and Setup

```bash
cd lead-portal
```

### 2. Backend Setup

#### Get Gmail API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Search for "Gmail API"
   - Click "Enable"
4. Create OAuth2 credentials:
   - Go to "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:3001/auth/callback`
     - `http://localhost:3000` (for development)
   - Copy `Client ID` and `Client Secret`

#### Configure Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Gmail credentials:
# GMAIL_CLIENT_ID=your_client_id
# GMAIL_CLIENT_SECRET=your_client_secret
# GMAIL_REDIRECT_URI=http://localhost:3001/auth/callback
# FRONTEND_URL=http://localhost:3000
# PORT=3001
```

#### Run Backend

```bash
npm start
# Server runs on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3001 npm start
# Frontend runs on http://localhost:3000
```

### 4. Usage

1. Click "🔄 Refresh" to sync Gmail emails
2. Emails appear in "Do First" quadrant (Urgent & Important)
3. Drag tasks between quadrants to prioritize:
   - **Do First**: Urgent & Important
   - **Schedule**: Not Urgent & Important
   - **Delegate**: Urgent & Not Important
   - **Eliminate**: Not Urgent & Not Important
4. Check off tasks as complete
5. Add manual tasks with "➕ Add Task"

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| POST | `/tasks/refresh` | Sync Gmail emails |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/url` | Get Gmail OAuth URL |
| GET | `/auth/callback` | OAuth callback handler |

## Extending to Other Services

### Adding Microsoft Outlook Integration

1. **Install Outlook SDK:**
   ```bash
   npm install @microsoft/microsoft-graph-client isomorphic-fetch
   ```

2. **Create `/backend/services/outlookService.js`:**
   ```javascript
   const graph = require('@microsoft/microsoft-graph-client');

   async function getOutlookEmails(accessToken) {
     const client = graph.Client.init({
       authProvider: (done) => {
         done(null, accessToken);
       }
     });

     try {
       const response = await client
         .api('/me/messages')
         .filter("isRead eq false")
         .get();

       return response.value.map(msg => ({
         id: msg.id,
         from: msg.from.emailAddress.name,
         subject: msg.subject,
         snippet: msg.bodyPreview,
         date: msg.receivedDateTime,
         source: 'outlook',
         link: `https://outlook.live.com/mail/0/inbox/${msg.id}`
       }));
     } catch (error) {
       console.error('Outlook error:', error);
       return [];
     }
   }

   module.exports = { getOutlookEmails };
   ```

3. **Update `/backend/server.js`:**
   - Add Outlook OAuth routes (similar to Gmail)
   - Create `/tasks/refresh/outlook` endpoint
   - Integrate with existing task aggregation

### Adding ServiceNow Integration

1. **Install ServiceNow SDK:**
   ```bash
   npm install axios
   ```

2. **Create `/backend/services/servicenowService.js`:**
   ```javascript
   const axios = require('axios');

   async function getServiceNowTasks(instance, username, password) {
     const auth = Buffer.from(`${username}:${password}`).toString('base64');
     
     try {
       const response = await axios.get(
         `https://${instance}.service-now.com/api/now/table/incident`,
         {
           headers: { Authorization: `Basic ${auth}` },
           params: {
             sysparm_limit: 20,
             sysparm_query: 'stateNOT IN5,7'
           }
         }
       );

       return response.data.result.map(task => ({
         id: task.sys_id,
         title: task.short_description,
         description: task.description,
         from: task.assignment_group.display_value,
         source: 'servicenow',
         link: `https://${instance}.service-now.com/nav_to.do?uri=incident.do?sys_id=${task.sys_id}`,
         priority: mapPriority(task.priority),
         dueDate: task.due_date
       }));
     } catch (error) {
       console.error('ServiceNow error:', error);
       return [];
     }
   }

   function mapPriority(snPriority) {
     const map = { '1': 'high', '2': 'high', '3': 'medium', '4': 'low', '5': 'low' };
     return map[snPriority] || 'medium';
   }

   module.exports = { getServiceNowTasks };
   ```

### Adding Enova Integration

Similar approach to ServiceNow:
1. Use Enova's REST API with OAuth2 or API key
2. Map responses to task format
3. Add refresh endpoint to aggregation

## Data Schema

### Task Object

```javascript
{
  id: string,                    // Unique identifier
  title: string,                 // Task title
  description: string,           // Task description
  from: string,                  // Source (email address, system name)
  link: string,                  // Link to original item
  source: 'gmail'|'outlook'|..., // Source system
  quadrant: string,              // Current quadrant
  priority: 'high'|'medium'|'low',
  createdAt: ISO8601,            // When created
  dueDate: ISO8601 | null,       // Due date
  completed: boolean             // Completion status
}
```

## Deployment

### Heroku Deployment

1. **Create Heroku app:**
   ```bash
   heroku create lead-portal-app
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set GMAIL_CLIENT_ID=your_id
   heroku config:set GMAIL_CLIENT_SECRET=your_secret
   heroku config:set FRONTEND_URL=https://lead-portal-app.herokuapp.com
   ```

3. **Create `/Procfile`:**
   ```
   web: cd backend && npm start
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Vercel + Heroku Deployment

- **Frontend**: Deploy React app to Vercel
- **Backend**: Deploy Express to Heroku or Railway
- Update API URL in frontend environment

### Docker Deployment

Create `/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install backend
COPY backend ./backend
WORKDIR /app/backend
RUN npm install

# Install frontend
COPY frontend ../frontend
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app/backend
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t lead-portal .
docker run -e GMAIL_CLIENT_ID=... -p 3001:3001 lead-portal
```

## Security Considerations

1. **OAuth Tokens**: Store securely, use refresh tokens
2. **API Keys**: Never commit `.env` files, use environment variables
3. **CORS**: Configure properly for production domains
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate all user inputs on backend
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **CSRF Protection**: Add CSRF tokens for form submissions

## Performance Optimization

1. **Caching**: Cache Gmail results for 1 hour
2. **Pagination**: Load tasks in batches
3. **Lazy Loading**: Load quadrants on demand
4. **Compression**: Enable gzip compression
5. **CDN**: Serve frontend from CDN

## Monitoring

Add monitoring for:
- API response times
- Failed API calls
- User activity
- Task completion rates
- System errors

Suggested tools:
- Sentry (error tracking)
- LogRocket (user session replay)
- New Relic (performance monitoring)

## Future Enhancements

1. **More Integrations**: Teams, Slack, Calendar, Jira
2. **Real-time Sync**: WebSocket for live updates
3. **Notifications**: Email/Slack alerts for urgent tasks
4. **Recurring Tasks**: Support for recurring items
5. **Templates**: Task templates for common workflows
6. **Team Collaboration**: Share tasks with team members
7. **Analytics**: Dashboard showing productivity metrics
8. **Mobile App**: React Native mobile version
9. **Voice**: Add voice commands for hands-free operation
10. **AI Assistant**: Suggest quadrant placement using AI

## Troubleshooting

### "Gmail API not enabled"
- Go to Google Cloud Console → APIs & Services → Library
- Search for "Gmail API"
- Click "Enable"

### "CORS error"
- Backend proxy setting: Check `.env` and frontend `package.json` proxy
- Frontend API URL: Update `REACT_APP_API_URL`

### "Tasks not refreshing"
- Check backend logs for API errors
- Verify OAuth token is still valid
- Check network tab in browser DevTools

### "Drag and drop not working"
- Ensure `react-beautiful-dnd` is installed
- Check browser console for errors
- Clear browser cache and reload

## Support & Contributing

For issues or feature requests, create an issue in the repository.

## License

MIT License - See LICENSE file for details
