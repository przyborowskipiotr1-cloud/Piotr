# 📊 Lead Portal

A web-based task management dashboard for managers that aggregates information from multiple sources (Gmail, Outlook, Teams, ServiceNow, Enova, etc.) and displays them in an Eisenhower Matrix for intelligent prioritization.

## Features

✅ **Eisenhower Matrix** - Organize tasks by urgency and importance  
✅ **Drag & Drop** - Move tasks between quadrants with ease  
✅ **Gmail Integration** - Automatically pull unread emails  
✅ **Manual Tasks** - Add custom tasks directly  
✅ **Task Completion** - Mark tasks as done  
✅ **Auto Refresh** - Daily sync + manual refresh button  
✅ **Responsive Design** - Works on desktop and tablet  
✅ **Data Persistence** - Tasks saved locally  

## Quick Start

```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your Gmail API credentials
npm start

# In another terminal, install frontend
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

## The Eisenhower Matrix

Four quadrants to organize your work:

| | Important | Not Important |
|--|-----------|---------------|
| **Urgent** | Do First | Delegate |
| | Strategic decisions | Time-wasters |
| **Not Urgent** | Schedule | Eliminate |
| | Long-term projects | Distractions |

## Gmail Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Gmail API
3. Create OAuth2 credentials (Web Application)
4. Add redirect URI: `http://localhost:3001/auth/callback`
5. Copy Client ID & Secret to `.env`

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed setup.

## Extending to Other Services

The guide includes step-by-step code for adding:
- Microsoft Outlook
- ServiceNow
- Enova
- Teams
- And more...

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#extending-to-other-services)

## Deployment

### Vercel + Heroku (Recommended for MVP)

```bash
# Backend on Heroku
heroku create lead-portal-api
git push heroku main

# Frontend on Vercel
vercel
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#deployment) for full details.

## API Reference

```
GET    /tasks                 # Get all tasks
POST   /tasks                 # Create task
PUT    /tasks/:id             # Update task
DELETE /tasks/:id             # Delete task
POST   /tasks/refresh         # Sync Gmail
```

## Tech Stack

**Backend**: Node.js, Express, Gmail API  
**Frontend**: React, React Beautiful DND  
**Storage**: JSON (file-based, easily swap for DB)  
**Auth**: OAuth2

## Architecture

```
Lead Portal
├── Backend (API + OAuth + Gmail Sync)
└── Frontend (React + Eisenhower Matrix UI)
```

Data flows:
1. User clicks Refresh → Backend fetches Gmail
2. Gmail emails converted to tasks
3. Tasks returned to frontend
4. Frontend displays in matrix
5. User drags task → Frontend updates quadrant
6. API persists change

## Contributing

Contributions welcome! Areas for improvement:
- [ ] Database integration (currently JSON file)
- [ ] More service integrations
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app
- [ ] AI-powered task categorization
- [ ] Team collaboration features

## License

MIT

## Questions?

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for comprehensive documentation including:
- Detailed setup instructions
- API documentation
- Code examples for new integrations
- Deployment guides
- Troubleshooting
