require('dotenv').config();
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { getStatusData, getAllSites, addSite, removeSite } = require('./utils/checkStatus');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Get all sites
app.get('/sites', async (req, res) => {
    try {
        const sites = getAllSites();
        res.json(sites);
    } catch (error) {
        console.log('Error in /sites route:', error);
        res.status(500).json({ error: 'Failed to load sites.' });
    }
});

// Add a new site
app.post('/sites', async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }
        const result = addSite(name, url);
        res.json(result);
    } catch (error) {
        console.log('Error in /sites POST route:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove a site
app.delete('/sites', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const result = removeSite(url);
        res.json(result);
    } catch (error) {
        console.log('Error in /sites DELETE route:', error);
        res.status(500).json({ error: error.message });
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
