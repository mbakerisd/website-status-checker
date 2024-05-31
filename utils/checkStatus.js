const axios = require('axios');
const xlsx = require('xlsx');
const path = require('path');

async function checkUrl(name, url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url);
            return { name, url, status: 'up', error: 'Site is up' };
        } catch (error) {
            if (attempt < retries) {
                console.log(`Retrying ${url} (${attempt}/${retries})...`);
                continue;
            }
            const errorMessage = error.response ? `Error ${error.response.status}: ${error.response.statusText}` : 'No response or server not reachable';
            const errorResult = { name, url, status: 'down', error: errorMessage };
            console.log(`Error checking ${url}: ${JSON.stringify(errorResult)}`);
            return errorResult;
        }
    }
}

async function getStatusData() {
    try {
        const workbook = xlsx.readFile(path.join(__dirname, '..', 'data', 'name_and_urls.xlsx'));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        return await Promise.all(data.map(row => checkUrl(row.Name, row.URL)));
    } catch (error) {
        throw new Error(`Failed to read Excel file: ${error.message}`);
    }
}

module.exports = { getStatusData };
