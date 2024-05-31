document.addEventListener('DOMContentLoaded', function() {
    fetch('/check-status').then(response => response.json()).then(data => {
        let rowsHtml = '';

        data.forEach((result, index) => {
            const statusIcon = result.status === 'up' ? '<i class="fas fa-check-circle status-icon bg-success"></i>' : '<i class="fas fa-times-circle status-icon bg-danger"></i>';
            const errorMessage = result.error ? result.error : '';

            rowsHtml += `<tr>
                <td><b>${result.name}</b></td>
                <td><a href="${result.url}" target="_blank">${result.url}</a></td>
                <td class="status-cell">${statusIcon}</td>
                <td>${errorMessage}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewSite('${result.url}', '${result.error}')">View Site</button></td>
            </tr>`;
        });

        document.getElementById('results').innerHTML = rowsHtml;
    });
});

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
