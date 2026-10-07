# Lead Portal - Deployment Guide

This guide covers deploying Lead Portal to production.

## Option 1: Railway.app (Recommended - Easiest)

Railway is perfect for full-stack Node.js apps and has excellent Gmail API integration.

### Prerequisites
- GitHub account (for connecting repo)
- Railroad.app account (free tier available)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lead Portal"
   git remote add origin https://github.com/YOUR_USER/lead-portal.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your lead-portal repository
   - Railway auto-detects it's a Node.js project

3. **Set Environment Variables**
   - In Railway dashboard, go to "Variables"
   - Add:
     ```
     GMAIL_CLIENT_ID=your_client_id
     GMAIL_CLIENT_SECRET=your_client_secret
     GMAIL_REDIRECT_URI=https://your-railway-domain.up.railway.app/auth/callback
     FRONTEND_URL=https://your-railway-domain.up.railway.app
     NODE_ENV=production
     ```

4. **Configure Build**
   - Railway should auto-detect `npm start` in backend
   - If not, set build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

5. **Deploy Frontend**
   - Option A: Build and serve from backend
   - Option B: Deploy frontend separately to Vercel

### Full-Stack Setup on Railway

Create `/backend/server.js` middleware to serve frontend:

```javascript
// Add this after app initialization
const path = require('path');
const express = require('express');

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Fallback to index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

Then update `/Procfile`:
```
web: npm install --prefix frontend && npm run build --prefix frontend && cd backend && npm start
```

## Option 2: Vercel + Heroku

### Deploy Backend to Heroku

1. **Create Heroku Account** (free tier available)

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create lead-portal-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set GMAIL_CLIENT_ID=your_id --app lead-portal-backend
   heroku config:set GMAIL_CLIENT_SECRET=your_secret --app lead-portal-backend
   heroku config:set GMAIL_REDIRECT_URI=https://lead-portal-backend.herokuapp.com/auth/callback
   heroku config:set FRONTEND_URL=https://lead-portal-frontend.vercel.app
   ```

5. **Create Procfile** (in root):
   ```
   web: cd backend && npm install && npm start
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Deploy Frontend to Vercel

1. **Create Vercel Account** (free tier available)

2. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → "Import Git Repository"
   - Select lead-portal repo
   - Set root directory: `frontend`

3. **Environment Variables**
   - Add `REACT_APP_API_URL=https://lead-portal-backend.herokuapp.com`

4. **Deploy**
   - Vercel auto-deploys on git push

## Option 3: Docker + Cloud Run (Google Cloud)

### Setup

1. **Create Dockerfile** (in root):
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Backend
   COPY backend ./backend
   WORKDIR /app/backend
   RUN npm install --production

   # Frontend
   COPY frontend ./frontend
   WORKDIR /app/frontend
   RUN npm install && npm run build

   WORKDIR /app/backend
   
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

2. **Create .dockerignore**:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   .env
   .DS_Store
   ```

3. **Build & Push to Docker Hub**
   ```bash
   docker build -t yourusername/lead-portal .
   docker push yourusername/lead-portal
   ```

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy lead-portal \
     --image yourusername/lead-portal \
     --platform managed \
     --region us-central1 \
     --set-env-vars="GMAIL_CLIENT_ID=your_id,GMAIL_CLIENT_SECRET=your_secret"
   ```

## Option 4: AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init -p node.js-18 lead-portal
   ```

3. **Create .ebextensions/nodecommand.config**:
   ```
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "cd backend && npm start"
   ```

4. **Deploy**
   ```bash
   eb create lead-portal-env
   eb deploy
   ```

## Post-Deployment Checklist

- [ ] Test Gmail authentication flow
- [ ] Verify API endpoints working
- [ ] Test frontend loads properly
- [ ] Refresh Gmail emails works
- [ ] Drag and drop functions
- [ ] HTTPS working
- [ ] Error logging setup
- [ ] Database backup strategy (if using DB)

## Custom Domain Setup

### Point Custom Domain to Railway/Heroku

1. Get deployment URL from platform
2. Go to domain registrar (GoDaddy, Namecheap, etc.)
3. Update DNS CNAME record:
   ```
   CNAME: www → your-app.railway.app
   ```
4. Wait 24-48 hours for DNS propagation

### SSL Certificate

- Most platforms (Railway, Vercel, Heroku) provide free SSL
- No additional setup needed

## Monitoring & Scaling

### Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker/Cloud Run
gcloud logging read "resource.type=cloud_run_revision"
```

### Scaling

**Railway**: Auto-scales, paid tiers available  
**Heroku**: Use `heroku ps:scale web=2`  
**Cloud Run**: Auto-scales, pay per request  

## Environment-Specific Configuration

### Development
```
NODE_ENV=development
DEBUG=true
```

### Staging
```
NODE_ENV=staging
DEBUG=false
```

### Production
```
NODE_ENV=production
DEBUG=false
RATE_LIMIT=true
```

## Rollback Strategy

### Git-based
```bash
# Railway/Heroku
git revert <commit-hash>
git push heroku main

# Vercel
Vercel auto-keeps previous deployments, use dashboard to rollback
```

### Database Backup (if using)
```bash
# Before any major deployment
mysqldump -u user -p database > backup.sql
```

## Troubleshooting Deployment

### "Cannot find module"
- Ensure all dependencies in package.json
- Run `npm install` locally first
- Check node_modules in .gitignore

### "Heroku build fails"
- Check buildpacks: `heroku buildpacks`
- Add if needed: `heroku buildpacks:add heroku/nodejs`

### "CORS errors in production"
- Update backend CORS config:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  ```

### "Gmail API failing in production"
- Verify redirect URI matches exactly
- Check OAuth credentials are correct
- Ensure API is enabled in Google Cloud

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Cost Estimation

| Service | Free Tier | Typical Cost |
|---------|-----------|-------------|
| Railway | $5/mo credit | $7-20/mo |
| Heroku | Deprecated | $50+/mo |
| Vercel | Generous free | $0-20/mo |
| Railway Docker | Included | $5-30/mo |
| AWS Cloud Run | 2M requests/mo free | $0-10/mo |

**Recommended**: Railway for simplicity, Cloud Run for scale.

## Security for Production

1. **Rotate Credentials Regularly**
   ```bash
   # Every 90 days
   heroku config:set GMAIL_CLIENT_SECRET=new_secret
   ```

2. **Use Secrets Manager**
   - Railway: Built-in secrets
   - Heroku: Config vars
   - AWS: Secrets Manager
   - Google Cloud: Secret Manager

3. **Enable HTTPS Only**
   ```javascript
   app.use((req, res, next) => {
     if (process.env.NODE_ENV === 'production') {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(308, `https://${req.header('host')}${req.url}`);
       }
    }
    next();
   });
   ```

4. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

5. **CSRF Protection**
   ```bash
   npm install csurf cookie-parser
   ```

---

**Need help?** Check the main [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
