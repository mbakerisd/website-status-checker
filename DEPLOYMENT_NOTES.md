# Deployment Notes for AWS Bitnami Server

## New Features Added

### Site Management (No Database Required)
Users can now add and remove sites directly from the web interface. Changes are saved to the Excel file (`data/name_and_urls.xlsx`).

## Features Implemented

### 1. Add New Sites
- Users can add new sites via the web interface
- Fields: Site Name and URL
- URL validation included
- Duplicate URL prevention
- Changes are immediately saved to the Excel file

### 2. Remove Sites
- Each site has a "Remove" button
- Confirmation dialog before deletion
- Changes are immediately saved to the Excel file

### 3. Real-time Updates
- After adding or removing a site, the page automatically refreshes
- New sites will be included in the next status check
- Removed sites will no longer be monitored

## API Endpoints

### GET /sites
Returns all sites from the Excel file
```bash
curl http://localhost:3001/sites
```

### POST /sites
Add a new site
```bash
curl -X POST http://localhost:3001/sites \
  -H "Content-Type: application/json" \
  -d '{"name": "Example Site", "url": "https://example.com"}'
```

### DELETE /sites
Remove a site by URL
```bash
curl -X DELETE http://localhost:3001/sites \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Important Notes for AWS Deployment

### 1. File Permissions
Make sure the Node.js process has write permissions to the Excel file:
```bash
chmod 666 /path/to/data/name_and_urls.xlsx
chmod 777 /path/to/data/
```

### 2. Backup Strategy
Since the Excel file is your data source, create regular backups:
```bash
# Add to crontab
0 */6 * * * cp /path/to/data/name_and_urls.xlsx /path/to/backups/name_and_urls_$(date +\%Y\%m\%d_\%H\%M\%S).xlsx
```

### 3. Environment Variables
Set the PORT in your `.env` file or environment:
```bash
PORT=3000
```

### 4. Using PM2 (Already in package.json)
```bash
# Start the app with PM2
pm2 start server.js --name website-status-checker

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 5. Nginx Configuration (if using reverse proxy)
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Security Considerations

### 1. Add Authentication (Recommended)
Since users can now modify the site list, consider adding authentication:

```bash
npm install express-basic-auth
```

Then add to server.js:
```javascript
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
    users: { 'admin': 'your-secure-password' },
    challenge: true
}));
```

### 2. Rate Limiting
Prevent abuse of add/remove endpoints:

```bash
npm install express-rate-limit
```

### 3. Input Validation
The current implementation includes basic validation, but consider adding more robust validation for production.

## Testing Locally

1. Make sure the server is running on port 3001 (or your configured port)
2. Open http://localhost:3001 in your browser
3. Try adding a test site (e.g., "Test Site", "https://google.com")
4. Verify the site appears in the table
5. Try removing the test site
6. Check that the Excel file has been updated

## Troubleshooting

### "Failed to add site: Site with this URL already exists"
- Check the Excel file for duplicate URLs
- URLs must be exact matches (including protocol)

### "Failed to read Excel file"
- Check file permissions
- Verify the file path is correct
- Ensure the Excel file is not open in another application

### Changes not persisting after server restart
- Verify write permissions on the data directory
- Check for file locking issues
- Review server logs for errors

## Monitoring

Check PM2 logs for any errors:
```bash
pm2 logs website-status-checker
```

## Backup and Recovery

If the Excel file gets corrupted:
1. Stop the server
2. Restore from backup
3. Restart the server

```bash
pm2 stop website-status-checker
cp /path/to/backup/name_and_urls.xlsx /path/to/data/name_and_urls.xlsx
pm2 restart website-status-checker
```
