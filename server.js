require('dotenv').config();
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { getStatusData, getAllSites, addSite, removeSite } = require('./utils/checkStatus');
const app = express();
const PORT = process.env.PORT || 3000;

// Cache for status data
let statusCache = [];
let lastUpdate = null;
let isChecking = false;
let cacheReady = false;

// Function to update cache
async function updateStatusCache() {
    if (isChecking) {
        console.log('Status check already in progress, skipping...');
        return;
    }
    
    isChecking = true;
    console.log('Updating status cache...');
    try {
        const results = await getStatusData();
        statusCache = results;
        lastUpdate = new Date();
        cacheReady = true;
        console.log(`Cache updated at ${lastUpdate.toLocaleString()} - ${results.length} sites checked`);
    } catch (error) {
        console.log('Error updating cache:', error);
    } finally {
        isChecking = false;
    }
}

// Update cache every 30 minutes
setInterval(updateStatusCache, 30 * 60 * 1000);

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
        // Return cached data immediately if available
        if (statusCache.length > 0) {
            res.json(statusCache);
        } else if (isChecking) {
            // Cache is being built, return empty array with message
            console.log('Cache is being built, returning empty array...');
            res.json([]);
        } else {
            // Cache is empty and not checking, trigger update and return empty
            console.log('Cache empty, triggering background update...');
            updateStatusCache(); // Don't await - let it run in background
            res.json([]);
        }
    } catch (error) {
        console.log('Error in /check-status route:', error);
        res.status(500).json({ error: 'Failed to load URLs or check their status.' });
    }
});

// New endpoint to force refresh cache
app.post('/refresh-status', async (req, res) => {
    try {
        console.log('Manual cache refresh requested');
        await updateStatusCache();
        res.json({ 
            success: true, 
            message: 'Status cache refreshed',
            lastUpdate: lastUpdate,
            sitesChecked: statusCache.length
        });
    } catch (error) {
        console.log('Error refreshing status:', error);
        res.status(500).json({ error: 'Failed to refresh status' });
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
        const { name, url, manualCheck } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }
        const result = addSite(name, url, manualCheck);
        
        // Trigger cache update in background
        setTimeout(() => updateStatusCache(), 1000);
        
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
        
        // Trigger cache update in background
        setTimeout(() => updateStatusCache(), 1000);
        
        res.json(result);
    } catch (error) {
        console.log('Error in /sites DELETE route:', error);
        res.status(500).json({ error: error.message });
    }
});

// Schedule to run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
    console.log('Running scheduled check at 6 AM');
    await updateStatusCache();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Cache system enabled - status checks run in background');
    console.log('Cache updates: Every 30 minutes + Daily at 6 AM');
    
    // Start initial cache update in background after server is ready
    setTimeout(() => {
        console.log('Starting initial cache load...');
        updateStatusCache();
    }, 2000); // Wait 2 seconds after server starts
});
