/* Service Worker - کاتالوگ هوشمند اتروپارس */
/* استراتژی: Network First برای فایل‌های اصلی - همیشه آخرین نسخه */

const CACHE_VERSION = 'atropars-v20260630';
const STATIC_CACHE  = 'atropars-static-v20260630';

/* فایل‌هایی که باید همیشه از شبکه بیان (نه cache) */
const NETWORK_FIRST = ['products.js', 'app.js', 'style.css', 'index.html', '/', ''];

/* نصب - فوراً جایگزین نسخه قبلی بشه */
self.addEventListener('install', e => {
    self.skipWaiting();
});

/* دریافت پیام از صفحه برای فعال‌سازی فوری */
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/* فعال‌سازی - پاک کردن همه cache های قدیمی و گرفتن کنترل فوری */
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

/* درخواست‌ها */
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    const filename = url.pathname.split('/').pop();

    /* فایل‌های اصلی - همیشه مستقیم از شبکه، بدون هیچ cache */
    if (NETWORK_FIRST.some(f => filename === f || filename.startsWith(f + '?'))) {
        e.respondWith(
            fetch(e.request, { cache: 'no-store' })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    /* بقیه (عکس‌ها و...) - از cache اگه بود، وگرنه شبکه */
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
                }
                return resp;
            }).catch(() => cached);
        })
    );
});

/* پیام push */
self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : {};
    e.waitUntil(self.registration.showNotification(
        data.title || 'کاتالوگ اتروپارس',
        {
            body: data.body || 'پیام جدید',
            icon: './icon-192.png',
            badge: './icon-192.png',
            dir: 'rtl', lang: 'fa',
            vibrate: [200, 100, 200],
            data: { url: data.url || './' }
        }
    ));
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});
