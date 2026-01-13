const axios = require('axios');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '..', 'data', 'name_and_urls.xlsx');

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
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        return await Promise.all(data.map(row => checkUrl(row.Name, row.URL)));
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

function addSite(name, url) {
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
        
        // Add new site
        data.push({ Name: name, URL: url });
        
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
