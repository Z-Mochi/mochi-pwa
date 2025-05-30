// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => () => {
            console.log('Service Worker registered successfully:', reg);
            checkForUpdatesPeriodically(); // Start checking for updates
        })
        .catch(err => console.error('Service Worker registration failed:', err));
}
let previousUrl = '';

const DATA_URL = "https://5oygz.wiremockapi.cloud/json/1"
// Function to periodically check for updates
function checkForUpdatesPeriodically() {
    setInterval(() => {
        fetch(DATA_URL)
            .then(response => response.json())
            .then(data => {
                let url = data.url;
                console.log(url)
                document.getElementById('content').innerHTML = "Load content from " + url;
                previousUrl = url; // Update the previous URL
            })
            .catch(error => document.getElementById('content').innerHTML = 'Network error !');
    }, 2000);
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