document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('progressBar');
    const header = document.getElementById('header');
    const statusSummary = document.getElementById('statusSummary');

    function updateProgressBar(percent) {
        progressBar.style.width = percent + '%';
    }

    function showLoading() {
        progressBar.style.display = 'block';
        progressBar.style.width = '0%';
    }

    function hideLoading() {
        progressBar.style.display = 'none';
    }

    function viewSite(url, error) {
        if (error && error.includes('No response or server not reachable')) {
            alert('This site was previously reported as unreachable. Retrying now...');
            fetch(`/check-status?url=${encodeURIComponent(url)}`)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 'up') {
                        showLightbox(url);
                    } else {
                        alert('Site is still unreachable: ' + result.error);
                    }
                })
                .catch(err => {
                    alert('Error checking site status: ' + err.message);
                });
        } else {
            showLightbox(url);
        }
    }

    function showLightbox(url) {
        const lightbox = document.getElementById('lightbox');
        const lightboxFrame = document.getElementById('lightbox-frame');
        lightboxFrame.src = url;
        lightbox.style.display = 'flex';
    }

    document.querySelector('.lightbox .close').addEventListener('click', function() {
        document.getElementById('lightbox').style.display = 'none';
        document.getElementById('lightbox-frame').src = '';
    });

    showLoading();

    fetch('/check-status').then(response => response.json()).then(data => {
        let upCount = 0;
        let downCount = 0;
        let cautionCount = 0;
        const totalSites = data.length;

        data.forEach((result, index) => {
            let statusIcon;
            let errorMessage = result.error ? result.error : '';
            let viewButton = `<button class="btn btn-sm btn-primary view-site-btn" data-url="${result.url}" data-error="${result.error || ''}"><i class="fas fa-eye"></i> View</button>`;

            // Check if this site requires manual checking
            if (result.status === 'caution' || result.manualCheck) {
                statusIcon = '<i class="fas fa-exclamation-triangle status-icon bg-warning" style="color: orange;"></i>';
                errorMessage = 'Manual check required';
                viewButton = ''; // Remove the button for caution sites
                cautionCount++;
            } else if (result.status === 'up') {
                statusIcon = '<i class="fas fa-check-circle status-icon bg-success"></i>';
                upCount++;
                errorMessage = 'Site is up';
            } else {
                statusIcon = '<i class="fas fa-times-circle status-icon bg-danger"></i>';
                downCount++;
            }

            const rowHtml = `<tr class="row${index}">
                <td><b>${result.name}</b></td>
                <td><a href="${result.url}" target="_blank">${result.url}</a></td>
                <td class="status-cell">${statusIcon}</td>
                <td>${errorMessage}</td>
                <td>${viewButton}</td>
                <td><button class="btn btn-sm btn-danger delete-site-btn" data-url="${result.url}"><i class="fas fa-trash"></i> Remove</button></td>
            </tr>`;
            const row = $(rowHtml).appendTo('#results');

            // Fade in the row after it has been appended
            setTimeout(() => row.addClass('visible'), index * 200);

            // Update progress bar
            const percentComplete = ((index + 1) / totalSites) * 100;
            setTimeout(() => updateProgressBar(percentComplete), index * 200);
        });

        const currentDateTime = new Date();
        document.getElementById('currentDateTime').textContent = currentDateTime.toLocaleString();
        document.getElementById('lastUpdate').textContent = currentDateTime.toLocaleString();

        // Fade in the header and status summary after all rows are loaded
        setTimeout(() => {
            header.style.opacity = 1;
            statusSummary.innerHTML = `<p><i class="fas fa-check-circle bg-success"></i> <strong>${upCount}</strong> sites are up</p>
                                       <p><i class="fas fa-times-circle bg-danger"></i> <strong>${downCount}</strong> sites are down</p>
                                       <p><i class="fas fa-exclamation-triangle bg-warning" style="color: orange;"></i> <strong>${cautionCount}</strong> sites need manual check</p>`;
            statusSummary.style.opacity = 1;
        }, totalSites * 200 + 500);

        // Hide the progress bar after all rows are loaded
        setTimeout(hideLoading, totalSites * 200);
    }).catch(error => {
        console.error('Error fetching status:', error);
        hideLoading();
    });

    // Delegate event listener to handle dynamic content
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-site-btn')) {
            const url = event.target.getAttribute('data-url');
            const error = event.target.getAttribute('data-error');
            viewSite(url, error);
        }
        
        // Handle delete button clicks
        if (event.target.classList.contains('delete-site-btn') || event.target.closest('.delete-site-btn')) {
            const button = event.target.classList.contains('delete-site-btn') ? event.target : event.target.closest('.delete-site-btn');
            const url = button.getAttribute('data-url');
            deleteSite(url);
        }
    });
});

// Function to add a new site
function addNewSite() {
    const name = document.getElementById('siteName').value.trim();
    const url = document.getElementById('siteUrl').value.trim();
    const manualCheck = document.getElementById('manualCheck').checked;
    const messageDiv = document.getElementById('managementMessage');
    
    if (!name || !url) {
        showMessage('Please enter both site name and URL', 'error');
        return;
    }
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showMessage('URL must start with http:// or https://', 'error');
        return;
    }
    
    fetch('/sites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url, manualCheck })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Site added successfully! Refreshing...', 'success');
            document.getElementById('siteName').value = '';
            document.getElementById('siteUrl').value = '';
            document.getElementById('manualCheck').checked = false;
            setTimeout(() => location.reload(), 1500);
        } else {
            showMessage(data.error || 'Failed to add site', 'error');
        }
    })
    .catch(error => {
        showMessage('Error adding site: ' + error.message, 'error');
    });
}

// Function to delete a site
function deleteSite(url) {
    if (!confirm(`Are you sure you want to remove this site?\n\n${url}`)) {
        return;
    }
    
    fetch('/sites', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Site removed successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showMessage(data.error || 'Failed to remove site', 'error');
        }
    })
    .catch(error => {
        showMessage('Error removing site: ' + error.message, 'error');
    });
}

// Function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('managementMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
