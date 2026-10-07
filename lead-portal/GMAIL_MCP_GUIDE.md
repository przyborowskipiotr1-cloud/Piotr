# Gmail Integration via MCP

This app now uses **Claude's Gmail MCP** instead of OAuth2. No setup needed!

## How to Use

### 1. Fetch Emails from Claude

In your Claude Code session, ask:

```
"Fetch my unread Gmail emails and add to Lead Portal tasks"
```

Claude will:
- Search your unread Gmail emails
- Convert them to tasks
- Assign them to Eisenhower Matrix quadrants
- Save to the app's database

### 2. Supported Queries

```
"Get my last 10 unread emails"
"Fetch emails from my team about urgent decisions"
"Find emails containing 'approval needed' from the past 24 hours"
"Show me important emails from directors and managers"
"Get emails with subject containing 'budget' or 'strategy'"
```

### 3. Refresh in App

After Claude fetches emails:
1. Click "🔄 Refresh" button in the app
2. New tasks appear in the Matrix
3. They're auto-assigned based on:
   - Email content (urgent/important keywords)
   - Sender importance
   - Subject line keywords

## How It Works

```
Claude Session (This Window)
    ↓
    Uses Gmail MCP to fetch emails
    ↓
Calls saveEmailsAsTasksFromMCP()
    ↓
Saves to tasks.json
    ↓
Lead Portal App (Browser)
    ↓
Click Refresh → Loads tasks.json
    ↓
Display in Matrix
```

## Smart Assignment Rules

When emails are converted to tasks:

### Urgent Keywords
- `urgent`
- `asap`
- `critical`
- `approval needed`
- `decision needed`

### Important Keywords
- `strategic`
- `decision`
- `planning`
- `review`
- `proposal`

### Quadrant Assignment Logic

| Urgent | Important | → Quadrant |
|--------|-----------|-----------|
| Yes | Yes | Do First (Red) |
| No | Yes | Schedule (Blue) |
| Yes | No | Delegate (Orange) |
| No | No | Eliminate (Gray) |

## Example Commands

### Fetch Critical Emails

```
"Get all emails marked as urgent or with approval needed"
```

Result: Tasks go to "Do First" (Red quadrant)

### Fetch Strategic Emails

```
"Fetch emails containing strategic, planning, or decision"
```

Result: Tasks go to "Schedule" (Blue quadrant)

### Fetch Routine Tasks

```
"Get status update emails and routine requests"
```

Result: Tasks go to "Delegate" (Orange quadrant)

### Clean Up Low Priority

```
"Find all FYI, informational, and newsletter emails"
```

Result: Tasks go to "Eliminate" (Gray quadrant)

## Advanced Usage

### Filter by Sender

```
"Fetch emails from [person@company.com] that are marked urgent"
```

### Time-based Fetch

```
"Get all emails from the last 24 hours with decision or approval keywords"
```

### Multiple Criteria

```
"Find emails from executives (directors, C-level) about strategy or planning"
```

## MCP Benefits

✅ **No OAuth Setup** - No Google Cloud Console needed  
✅ **Privacy** - Your credentials stay in Claude  
✅ **Flexible** - Ask for exactly what you need  
✅ **Smart** - Claude understands context  
✅ **Secure** - No tokens stored in the app  

## Backend Helper

The app includes `backend/gmailMCP.js` which provides:

```javascript
saveEmailsAsTasksFromMCP(emails)
```

This function:
- Takes email objects from MCP
- Converts to task format
- Auto-assigns quadrant
- Deduplicates (no duplicates)
- Saves to tasks.json

## Tips

1. **Ask specific questions** - More specific = better results
2. **Use keywords** - Include urgent/important keywords in your query
3. **Batch operations** - "Get emails about [topic] OR [topic2]"
4. **Regular refresh** - Check app daily to sync latest emails
5. **Customize rules** - Edit urgent/important keywords in Settings → Assignment Rules

## Troubleshooting

### Emails Not Showing Up

- Confirm Claude fetched them: "How many emails did you find?"
- Check tasks.json was updated (check file timestamp)
- Click Refresh button in app

### Wrong Quadrant Assignment

- Go to Settings → Assignment Rules
- Add/remove keywords to match your work style
- Or manually drag tasks to correct quadrant

### Duplicate Emails

- App automatically deduplicates by email ID
- Each email only added once

## Next Steps

1. Ask Claude to fetch your first batch of emails
2. See them appear in the app
3. Drag to organize as needed
4. Customize keywords in Settings
5. Check the app daily to keep up with emails

---

**Ready?** Just ask Claude: "Fetch my unread Gmail emails" 🚀
