// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered successfully:', reg))
        .catch(err => console.error('Service Worker registration failed:', err));

    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'NEW_VERSION_AVAILABLE') {
            // Thông báo hoặc tự động reload
            if (confirm("Có bản cập nhật mới. Tải lại trang?")) {
                window.location.reload();
            }
        }
    });
}

// Handle the beforeinstallprompt event
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Ngăn Chrome hiển thị tự động
    deferredPrompt = e; // Lưu lại sự kiện
    document.getElementById('install-button').style.display = 'block'; // Hiện nút
});

document.getElementById('install-button').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // Hiển thị prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Người dùng chọn: ${outcome}`);
        deferredPrompt = null;
        document.getElementById('install-button').style.display = 'none';
    }
});
