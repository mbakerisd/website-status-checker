# Website Status Checker

## Description
A comprehensive Node.js application that monitors website availability in real-time. This tool reads websites from an Excel file, checks their HTTP status, and provides a modern web interface for viewing results, adding new sites, and removing existing ones. Perfect for IT teams managing multiple websites, especially on AWS Bitnami servers.

## ✨ Key Features

### 🔍 Monitoring & Status Checking
- **Real-time Status Checks**: Monitors HTTP availability of all websites
- **Automatic Retries**: Attempts connection 3 times before marking a site as down  
- **Scheduled Checks**: Automatically runs daily at 6:00 AM
- **Visual Status Indicators**: 
  - ✅ Green check for sites that are up
  - ❌ Red X for sites that are down
  - ⚠️ Orange warning for sites requiring manual verification

### 🎛️ Site Management (No Database Required)
- **Add Sites**: Users can add new websites through the web interface
- **Remove Sites**: Delete sites with a single click (with confirmation)
- **Persistent Storage**: All changes saved directly to Excel file on server
- **Duplicate Prevention**: Prevents adding sites with duplicate URLs
- **URL Validation**: Ensures proper URL format (http:// or https://)

### 🎨 Modern User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Page refreshes automatically after add/remove operations
- **Interactive Lightbox**: Preview websites directly in the dashboard
- **Animated Status Loading**: Smooth fade-in effects as status checks complete
- **Status Summary**: Quick overview of up/down/caution sites

### 🔧 Technical Features
- **Excel-Based Storage**: Uses `name_and_urls.xlsx` as the data source
- **RESTful API**: Clean API endpoints for all operations
- **Express Server**: Fast and reliable Node.js backend
- **Async Operations**: Non-blocking status checks for better performance
- **Error Handling**: Comprehensive error messages and status codes

## 📋 Prerequisites

- **Node.js**: Version 14.x or higher
- **npm**: Comes with Node.js
- **Excel File**: `data/name_and_urls.xlsx` with columns: `Name` and `URL`

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mbakerisd/website-status-checker.git
cd website-status-checker
```

### 2. Install Dependencies
```bash
npm install
```

This installs: `express`, `axios`, `ejs`, `xlsx`, `node-cron`, `dotenv`, `nodemon`, `pm2`

### 3. Configure Environment (Optional)
Create `.env` file:
```env
PORT=3000
```

### 4. Prepare Excel File
Structure your `data/name_and_urls.xlsx`:
```
| Name                | URL                          |
|---------------------|------------------------------|
| Google              | https://www.google.com       |
| Company Website     | https://example.com          |
```

### 5. Start the Application

**Development Mode**:
```bash
npx nodemon server.js
```

**Production Mode**:
```bash
node server.js
# or
pm2 start server.js --name website-checker
```

### 6. Access
```
http://localhost:3000
```

## 🏗️ How The Application Works

### Architecture
```
Browser → Express Server → Status Checker → Excel File & Target Websites
```

### Data Flows

**Page Load**: User visits → Server renders page → JS fetches /check-status → Status check → Display results

**Adding Site**: Form submit → POST /sites → Validate → Add to Excel → Save file → Refresh page

**Removing Site**: Click Remove → Confirm → DELETE /sites → Remove from Excel → Save file → Refresh

**Scheduled**: 6AM daily → Cron triggers → Check all sites → Log results

## 📡 API Endpoints

| Method | Endpoint        | Description         | Body                 | Response           |
|--------|-----------------|---------------------|----------------------|--------------------|
| GET    | `/`             | Dashboard page      | -                    | HTML               |
| GET    | `/check-status` | Get all statuses    | -                    | JSON array         |
| GET    | `/sites`        | Get all sites       | -                    | JSON array         |
| POST   | `/sites`        | Add site            | `{name, url}`        | `{success, msg}`   |
| DELETE | `/sites`        | Remove site         | `{url}`              | `{success, msg}`   |

## 📂 File Structure

```
website-status-checker/
├── server.js                 # Express server
├── package.json              # Dependencies
├── data/
│   └── name_and_urls.xlsx    # Site storage
├── utils/
│   └── checkStatus.js        # Check logic
├── views/
│   └── index.ejs             # HTML template
├── public/
│   ├── css/styles.css        # Styling
│   ├── js/app.js             # Frontend JS
│   └── images/logo.jpg
└── README.md
```

## 💾 Data Persistence

**Excel File Storage:**
- ✅ No database needed
- ✅ Easy backups
- ✅ Human-readable
- ✅ Changes persist immediately
- ✅ Server restart safe

**Update Process:**
1. User adds/removes site
2. API receives request
3. Read Excel file
4. Modify data
5. Write Excel file
6. Return success
7. Page refreshes

## ⏰ Scheduled Tasks

```javascript
// Runs daily at 6 AM
cron.schedule('0 6 * * *', async () => {
    // Check all sites
});
```

**Format**: `minute hour day month dayOfWeek`
- `0 6 * * *` = 6:00 AM daily
- `0 */4 * * *` = Every 4 hours
- `*/30 * * * *` = Every 30 minutes

## 🔒 Security (Production)

1. **Add Authentication**:
   ```bash
   npm install express-basic-auth
   ```

2. **HTTPS** via reverse proxy (Nginx)

3. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```

4. **File Permissions**:
   ```bash
   chmod 666 data/name_and_urls.xlsx
   ```

See `DEPLOYMENT_NOTES.md` for AWS deployment.

## 🐛 Troubleshooting

**Port in use:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
PORT=3001 node server.js
```

**Sites not updating:**
- Check file permissions
- File not open in Excel
- Check logs

**Status checks failing:**
- Network connectivity
- Sites may block bots
- SSL certificate issues

## 📈 Future Enhancements

- Email/Slack notifications
- Status history & charts
- Response time monitoring
- Custom check intervals
- Export reports (PDF/CSV)
- User authentication
- Dashboard analytics

## 🚀 Quick Commands

```bash
# Install
npm install

# Dev mode
npx nodemon server.js

# Production
pm2 start server.js --name website-checker
pm2 save
pm2 startup

# Logs
pm2 logs website-checker
```

## 📄 License

ISC License

## 👥 Authors

- Original: mbakerisd  
- Enhanced: Site management + Modern UI

---

**Made with ❤️ for system administrators**
