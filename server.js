require('dotenv').config();
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { getStatusData } = require('./utils/checkStatus');
const app = express();
const PORT = '3000';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const currentDateTime = new Date();
    res.render('index', { currentDateTime });
});

app.get('/check-status', async (req, res) => {
    try {
        const results = await getStatusData();
        res.json(results);
    } catch (error) {
        console.log('Error in /check-status route:', error);
        res.status(500).json({ error: 'Failed to load URLs or check their status.' });
    }
});

// Schedule to run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
    console.log('Running scheduled check at 6 AM');
    try {
        const results = await getStatusData();
        console.log('Scheduled check results:', results);
    } catch (error) {
        console.log('Error during scheduled check:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
