/* Service Worker - کاتالوگ هوشمند اتروپارس */
const CACHE_NAME = 'atropars-v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './products.js',
    './style.css',
    './manifest.json'
];

/* نصب: کش کردن فایل‌های اصلی */
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

/* فعال‌سازی: پاک کردن کش قدیمی */
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

/* درخواست‌ها: اول کش، اگر نبود شبکه */
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                // فقط فایل‌های اصلی سایت رو کش کن
                if (e.request.url.includes(self.location.origin)) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => cached || new Response('آفلاین'));
        })
    );
});

/* پیام push برای اطلاع‌رسانی */
self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : {};
    const title = data.title || 'کاتالوگ اتروپارس';
    const options = {
        body: data.body || 'پیام جدید',
        icon: './icon-192.png',
        badge: './icon-192.png',
        dir: 'rtl',
        lang: 'fa',
        vibrate: [200, 100, 200],
        data: { url: data.url || './' }
    };
    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});
