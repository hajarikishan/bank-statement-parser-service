document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const statementFilesInput = document.getElementById('statementFiles');
    const fileNameDisplay = document.getElementById('file-name-display');
    const uploadsTableBody = document.querySelector('#uploadsTable tbody');
    const spinner = document.getElementById('spinner');
    const uploadButton = document.getElementById('uploadButton');

    // Display selected file names
    statementFilesInput.addEventListener('change', () => {
        if (statementFilesInput.files.length > 0) {
            const fileNames = Array.from(statementFilesInput.files).map(f => f.name).join(', ');
            fileNameDisplay.textContent = fileNames;
        } else {
            fileNameDisplay.textContent = 'No files selected';
        }
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const files = statementFilesInput.files;
        if (files.length === 0) {
            alert('Please select at least one file to upload.');
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append('statements', file);
        }

        // Show spinner and disable button
        spinner.style.display = 'block';
        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                // Clear previous uploads and display new ones
                uploadsTableBody.innerHTML = '';
                result.uploads.forEach(upload => {
                    addUploadToTable(upload);
                });
            } else {
                throw new Error(result.message || 'An error occurred during upload.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            // Hide spinner and re-enable button
            spinner.style.display = 'none';
            uploadButton.disabled = false;
            uploadButton.textContent = 'Upload';
            // Reset form
            uploadForm.reset();
            fileNameDisplay.textContent = 'No files selected';
        }
    });

    function addUploadToTable(upload) {
        const row = document.createElement('tr');
        
        // Note: You would ideally implement a polling mechanism to update the status.
        // For this assignment, we simply provide a download link.
        // The status shown here is the initial one from the server.
        const statusClass = `status-${upload.status.toLowerCase()}`;
        
        row.innerHTML = `
            <td>${upload.fileName}</td>
            <td>${upload.uploadId}</td>
            <td class="${statusClass}">${upload.status} (Refresh may be needed)</td>
            <td>
                <a href="/api/download/${upload.uploadId}" class="download-link" target="_blank">Download CSV</a>
            </td>
        `;
        uploadsTableBody.appendChild(row);
    }
});