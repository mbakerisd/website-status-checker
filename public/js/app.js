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
        if (error.includes('No response or server not reachable')) {
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
        const totalSites = data.length;

        data.forEach((result, index) => {
            const statusIcon = result.status === 'up' ? '<i class="fas fa-check-circle status-icon bg-success"></i>' : '<i class="fas fa-times-circle status-icon bg-danger"></i>';
            const errorMessage = result.error ? result.error : '';
            if (result.status === 'up') upCount++;
            if (result.status === 'down') downCount++;

            const rowHtml = `<tr class="row${index}">
                <td><b>${result.name}</b></td>
                <td><a href="${result.url}" target="_blank">${result.url}</a></td>
                <td class="status-cell">${statusIcon}</td>
                <td>${errorMessage}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewSite('${result.url}', '${result.error}')">View Site</button></td>
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

        // Fade in the header and status summary after all rows are loaded
        setTimeout(() => {
            header.style.opacity = 1;
            statusSummary.innerHTML = `<p><i class="fas fa-check-circle bg-success"></i> ${upCount} sites are up</p><p><i class="fas fa-times-circle bg-danger"></i> ${downCount} sites are down</p>`;
            statusSummary.style.opacity = 1;
        }, totalSites * 200 + 500);

        // Hide the progress bar after all rows are loaded
        setTimeout(hideLoading, totalSites * 200);
    }).catch(error => {
        console.error('Error fetching status:', error);
        hideLoading();
    });
});
