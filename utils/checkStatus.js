const axios = require('axios');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '..', 'data', 'name_and_urls.xlsx');

// Axios instance with timeout
const axiosInstance = axios.create({
    timeout: 10000, // 10 second timeout per request
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});

async function checkUrl(name, url, retries = 2, manualCheck = false) {
    // If marked for manual check, skip automatic checking
    if (manualCheck) {
        return { name, url, status: 'caution', error: 'Manual check required', manualCheck: true };
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axiosInstance.get(url);
            return { name, url, status: 'up', error: 'Site is up', manualCheck: false };
        } catch (error) {
            if (attempt < retries) {
                console.log(`Retrying ${url} (${attempt}/${retries})...`);
                continue;
            }
            let errorMessage;
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Request timed out';
            } else if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
            } else {
                errorMessage = 'No response or server not reachable';
            }
            const errorResult = { name, url, status: 'down', error: errorMessage, manualCheck: false };
            console.log(`Error checking ${url}: ${JSON.stringify(errorResult)}`);
            return errorResult;
        }
    }
}

async function getStatusData() {
    try {
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        const results = [];
        const batchSize = 10; // Process 10 sites at a time
        
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchPromises = batch.map(row => {
                const manualCheck = row.ManualCheck === 'Yes' || row.ManualCheck === true;
                return checkUrl(row.Name, row.URL, 2, manualCheck);
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            console.log(`Checked ${Math.min(i + batchSize, data.length)}/${data.length} sites...`);
        }
        
        return results;
    } catch (error) {
        throw new Error(`Failed to read Excel file: ${error.message}`);
    }
}

function getAllSites() {
    try {
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        return data;
    } catch (error) {
        throw new Error(`Failed to read Excel file: ${error.message}`);
    }
}

function addSite(name, url, manualCheck = false) {
    try {
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        // Check if URL already exists
        const exists = data.some(row => row.URL === url);
        if (exists) {
            throw new Error('Site with this URL already exists');
        }
        
        // Add new site with ManualCheck flag
        data.push({ Name: name, URL: url, ManualCheck: manualCheck ? 'Yes' : 'No' });
        
        // Write back to Excel
        const newWorksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = newWorksheet;
        xlsx.writeFile(workbook, EXCEL_FILE_PATH);
        
        return { success: true, message: 'Site added successfully' };
    } catch (error) {
        throw new Error(`Failed to add site: ${error.message}`);
    }
}

function removeSite(url) {
    try {
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        // Filter out the site with matching URL
        const filteredData = data.filter(row => row.URL !== url);
        
        if (filteredData.length === data.length) {
            throw new Error('Site not found');
        }
        
        // Write back to Excel
        const newWorksheet = xlsx.utils.json_to_sheet(filteredData);
        workbook.Sheets[sheetName] = newWorksheet;
        xlsx.writeFile(workbook, EXCEL_FILE_PATH);
        
        return { success: true, message: 'Site removed successfully' };
    } catch (error) {
        throw new Error(`Failed to remove site: ${error.message}`);
    }
}

module.exports = { getStatusData, getAllSites, addSite, removeSite };
