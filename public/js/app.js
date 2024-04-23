document.addEventListener('DOMContentLoaded', function() {
    fetch('/check-status').then(response => response.json()).then(data => {
        const total = data.length;
        const progressBar = document.getElementById('progress-bar');
        let completed = 0;

        data.forEach((result, index) => {
            setTimeout(() => {
                const row = `<tr>
                    <td><b>${result.name}<b></td>
                    <td><a href="${result.url}" target="_blank">${result.url}</a></td>
                    <td>${result.status}</td>
                </tr>`;
                document.getElementById('results').innerHTML += row;
                completed++;
                progressBar.style.width = `${(completed / total) * 100}%`;
                progressBar.setAttribute('aria-valuenow', (completed / total) * 100);
                if (completed === total) {
                    progressBar.classList.add('bg-success');
                }
            }, 100 * index); // Simulate a delay for demonstration
        });
    });
});
