// Register Service Worker
if ('serviceWorker' in navigator) {
    const newDate = new Date();
    navigator.serviceWorker.register(`service-worker.js?v=${newDate.getTime()}`)
        .then(reg => console.log('Service Worker registered successfully:', reg))
        .catch(err => console.error('Service Worker registration failed:', err));
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

console.log('test update app.js without update version');