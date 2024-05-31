# Website Status Checker

## Description
This Node.js application checks the status of websites listed in an Excel file and displays the results on a web page. It uses Express for the server, Axios for HTTP requests, and EJS for rendering views. The project includes functionality to display each site's availability status and makes the URL clickable for easy access.

## Features
- Reads URLs from an Excel file (`name_and_urls.xlsx`).
- Checks the HTTP status of each URL asynchronously.
- URLs are clickable and open in new tabs.

## Installation

To get started with this project, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mbakerisd/website-status-checker.git
   cd website-status-checker
