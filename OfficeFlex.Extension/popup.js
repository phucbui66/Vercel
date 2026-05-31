// ==== CẤU HÌNH DOMAIN PRODUCTION ====
// 1. Đổi link này thành link API Backend thật của bạn (nếu đã đưa lên mạn, ví dụ: https://officeflex-api.onrender.com)
const API_URL = 'https://breezy-cameras-yawn.loca.lt'; 

// 2. Đổi link này thành link Vercel mà bạn vừa Deploy thành công (ví dụ: https://officeflex-waiting.vercel.app)
const WEB_URL = 'https://vercel-lime-eta.vercel.app'; 
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileList = document.getElementById('file-list');
    const addMoreBtn = document.getElementById('add-more-btn');
    const convertBtn = document.getElementById('convert-btn');
    const formatSelect = document.getElementById('format-select');
    const statusMessage = document.getElementById('status-message');

    let selectedFiles = [];
    const allowedExtensions = ['.docx', '.xlsx', '.pptx', '.pdf'];

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    addMoreBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
            fileInput.value = ''; // Reset input to allow selecting same file again
        }
    });

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }

    function handleFiles(files) {
        let hasError = false;
        hideError();

        // Kiểm tra loại file hiện tại trong hàng chờ
        const currentHasPdf = selectedFiles.some(f => f.name.toLowerCase().endsWith('.pdf'));
        const currentHasOffice = selectedFiles.some(f => !f.name.toLowerCase().endsWith('.pdf'));

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            // Check duplicates
            const isDuplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size);
            if (isDuplicate) {
                continue;
            }

            if (!allowedExtensions.includes(ext)) {
                showError('Only .docx, .xlsx, .pptx, .pdf files are supported');
                hasError = true;
                continue;
            }

            if (file.size > 20 * 1024 * 1024) {
                showError('Each file size must not exceed 20MB');
                hasError = true;
                continue;
            }

            // Kiểm tra xem có bị trộn lẫn PDF và file Office không
            const isIncomingPdf = ext === '.pdf';
            const isIncomingOffice = ext !== '.pdf';

            const willHavePdf = currentHasPdf || isIncomingPdf;
            const willHaveOffice = currentHasOffice || isIncomingOffice;

            if (willHavePdf && willHaveOffice) {
                showError('Cannot convert a mix of PDF and Office files');
                hasError = true;
                continue;
            }

            selectedFiles.push(file);
        }

        renderFileList();
    }

    function renderFileList() {
        fileList.innerHTML = '';

        if (selectedFiles.length === 0) {
            fileInfo.classList.add('hidden');
            dropZone.style.display = 'flex';
            return;
        }

        dropZone.style.display = 'none';
        fileInfo.classList.remove('hidden');

        selectedFiles.forEach((file, index) => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            let icon = '📄';
            if (ext === '.docx') icon = '📝';
            else if (ext === '.xlsx') icon = '📊';
            else if (ext === '.pptx') icon = '📈';
            else if (ext === '.pdf') icon = '📕';

            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-item-info">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name-text" title="${file.name}">${file.name}</span>
                    <span class="file-item-size">(${formatBytes(file.size)})</span>
                </div>
                <button class="remove-file-btn" data-index="${index}" type="button">&times;</button>
            `;

            // Attach delete listener
            item.querySelector('.remove-file-btn').addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                selectedFiles.splice(idx, 1);
                renderFileList();
            });

            fileList.appendChild(item);
        });

        updateFormatSelect();
    }

    function updateFormatSelect() {
        if (selectedFiles.length === 0) return;
        const isPdfQueue = selectedFiles[0].name.toLowerCase().endsWith('.pdf');

        formatSelect.innerHTML = '';
        if (isPdfQueue) {
            formatSelect.innerHTML = `
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="pptx">PowerPoint (.pptx)</option>
            `;
        } else {
            formatSelect.innerHTML = `
                <option value="pdf">PDF</option>
            `;
        }
    }

    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showError(msg) {
        statusMessage.textContent = msg;
        statusMessage.classList.remove('hidden');
    }

    function hideError() {
        statusMessage.classList.add('hidden');
    }

    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        try {
            convertBtn.disabled = true;
            addMoreBtn.disabled = true;
            convertBtn.textContent = 'Uploading...';
            hideError();

            // Gửi HTTP POST song song lên API cho từng file
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('targetFormat', formatSelect.value);

                const response = await fetch(`${API_URL}/api/convert/upload`, {
                    method: 'POST',
                    headers: {
                        'Bypass-Tunnel-Reminder': 'true'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || `Failed to upload ${file.name}`);
                }

                const data = await response.json();
                return data.id; // Trả về Guid id của task
            });

            const ids = await Promise.all(uploadPromises);
            
            // Mở tab mới trỏ về trang chờ Next.js với danh sách các ID và tên file
            const names = selectedFiles.map(f => encodeURIComponent(f.name));
            const waitingUrl = `${WEB_URL}/waiting?ids=${ids.join(',')}&names=${names.join(',')}`;
            chrome.tabs.create({ url: waitingUrl });

            // Đóng popup sau khi hoàn thành
            setTimeout(() => {
                window.close();
            }, 500);

        } catch (error) {
            console.error('Error during batch upload:', error);
            showError('Error connecting to Server or Upload failed. Please make sure the Server is running.');
            convertBtn.disabled = false;
            addMoreBtn.disabled = false;
            convertBtn.textContent = 'Convert';
        }
    });
});
