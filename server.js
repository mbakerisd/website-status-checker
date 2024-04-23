const express = require('express');
const axios = require('axios');
const xlsx = require('xlsx');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');  // Setting EJS as the template engine
app.set('views', './views');    // Specifying the directory for views
app.use(express.static('public')); // Serving static files from the 'public' directory

// Function to check the status of a single URL
async function checkUrl(name, url) {
    try {
        const response = await axios.get(url);
        return { name, url, status: `Status Code = ${response.status}` };
    } catch (error) {
        // Improved error handling to provide more specific feedback
        return { 
            name, 
            url, 
            status: error.response ? `Error = ${error.response.status}` : 'No response or server not reachable'
        };
    }
}

// Route to render the main page
app.get('/', (req, res) => {
    res.render('index');  // Serving the main page using EJS template
});

// Route to handle the status checks
app.get('/check-status', async (req, res) => {
    try {
        // Reading from the Excel file
        const workbook = xlsx.readFile('data/name_and_urls.xlsx');
        const sheetName = workbook.SheetNames[0];  // Assuming the data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);  // Converting sheet data to JSON

        // Mapping over each row in the data to perform status checks
        const results = await Promise.all(data.map(row => checkUrl(row.Name, row.URL)));
        res.json(results);  // Sending results back as JSON
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to load URLs or check their status.' });
    }
});

// Listening on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
