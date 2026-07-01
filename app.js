/* =====================================================================
   کاتالوگ هوشمند اتروپارس - app.js
   بازنویسی کامل با تمام ویژگی‌های جدید
   ===================================================================== */

/* ---------------------------------------------------------------
   توابع کمکی عمومی
--------------------------------------------------------------- */
function formatPrice(num) {
    if (num === null || num === undefined || isNaN(num)) return "—";
    return Number(num).toLocaleString('en-US');
}

function toPersianDigits(str) {
    const d = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(str).replace(/[0-9]/g, n => d[n]);
}

function toEnDigits(str) {
    return String(str).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 1776);
}

function toNormalNum(str) {
    return parseFloat(toEnDigits(String(str))) || 0;
}

function toJalali(date) {
    const d = new Date(date);
    const jy = d.getFullYear() - 621;
    const jm = d.getMonth() + 1;
    const jd = d.getDate();
    return `${jy}/${String(jm).padStart(2,'0')}/${String(jd).padStart(2,'0')}`;
}

function nowJalali() {
    const d = new Date();
    const jy = d.getFullYear() - 621;
    const jm = d.getMonth() + 1;
    const jd = d.getDate();
    const h = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    return `${jy}/${String(jm).padStart(2,'0')}/${String(jd).padStart(2,'0')} - ${h}:${mi}`;
}

function addDaysJalali(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return toJalali(d);
}

function genId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
}

/* ---------------------------------------------------------------
   نوار تاریخ و ساعت زنده
--------------------------------------------------------------- */
let clockInterval = null;

function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
    const el = document.getElementById('liveClock');
    if (!el) { clearInterval(clockInterval); clockInterval = null; return; }
    el.textContent = nowJalali();
}

/* ---------------------------------------------------------------
   قیمت‌های لحظه‌ای (دلار، طلا، مس، آلومینیوم)
--------------------------------------------------------------- */
let marketPrices = JSON.parse(localStorage.getItem('market_prices') || 'null') || {
    dollar: '', gold: '', copper: '', aluminum: '', lastUpdate: ''
};

function saveMarketPrices() {
    localStorage.setItem('market_prices', JSON.stringify(marketPrices));
}

function renderMarketBar(page) {
    const bar = document.createElement('div');
    bar.className = 'market-bar';
    bar.id = 'marketBar';
    bar.innerHTML = `
        <div class="market-items">
            <div class="market-item">
                <span class="market-label">💵 دلار</span>
                <span class="market-val" id="mDollar">${marketPrices.dollar || 'در حال دریافت...'}</span>
            </div>
            <div class="market-item">
                <span class="market-label">🥇 طلا ۱۸</span>
                <span class="market-val" id="mGold">${marketPrices.gold || 'در حال دریافت...'}</span>
            </div>
            <div class="market-item">
                <span class="market-label">🔶 مس</span>
                <span class="market-val" id="mCopper">${marketPrices.copper || 'در حال دریافت...'}</span>
            </div>
            <div class="market-item">
                <span class="market-label">⚙️ آلومینیوم</span>
                <span class="market-val" id="mAluminum">${marketPrices.aluminum || 'در حال دریافت...'}</span>
            </div>
        </div>
        ${marketPrices.lastUpdate ? `<div class="market-update-time">آخرین بروزرسانی: ${marketPrices.lastUpdate}</div>` : ''}
    `;
    page.appendChild(bar);
    setTimeout(() => fetchMarketPrices(), 100);
}

function fetchMarketPrices() {
    // اولویت ۱: قیمت‌های دستی از پنل مدیریت (اگر تنظیم شده باشن جایگزین نمی‌شن)
    const manualOverride = CATALOG_DATA.meta.manualMarketPrices;
    if (manualOverride) {
        updateMarketDisplay();
        return;
    }
    // اولویت ۲: دریافت آنلاین از API رایگان brsapi
    fetch('https://brsapi.ir/Api/Market/Gold_Currency.php?key=FreeWdkeOR4FQM9LMb86kCgRrGS3xUpV')
        .then(r => r.json())
        .then(data => {
            if (data && data.gold && data.currency) {
                const usd  = data.currency.find(c => c.symbol === 'USD');
                const gold18 = data.gold.find(g => g.symbol === 'IR_GOLD_18K');
                if (usd)    marketPrices.dollar = formatPrice(usd.price);
                if (gold18) marketPrices.gold   = formatPrice(gold18.price);
                marketPrices.lastUpdate = nowJalali();
                saveMarketPrices();
                updateMarketDisplay();
            }
        })
        .catch(() => {
            // اگر آنلاین نشد، fallback: مقادیر ذخیره‌شده محلی نمایش داده می‌شه
            updateMarketDisplay();
        });
}

function updateMarketDisplay() {
    const fields = {mDollar: 'dollar', mGold: 'gold', mCopper: 'copper', mAluminum: 'aluminum'};
    for (const [id, key] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.textContent = marketPrices[key] || 'تنظیم نشده';
    }
}

function openMarketEditModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const box = document.createElement('div');
    box.className = 'glass-modal';
    box.innerHTML = `
        <div class="glass-modal-header">
            <span class="glass-modal-title">✏️ ویرایش قیمت‌های بازار</span>
            <button class="glass-modal-close">✕</button>
        </div>
        <div class="glass-modal-body">
            <label>💵 دلار (تومان):</label>
            <input type="text" id="editDollar" class="admin-input" value="${marketPrices.dollar || ''}" dir="ltr">
            <label>🥇 طلا گرمی (تومان):</label>
            <input type="text" id="editGold" class="admin-input" value="${marketPrices.gold || ''}" dir="ltr">
            <label>🔶 مس (تومان/کیلو):</label>
            <input type="text" id="editCopper" class="admin-input" value="${marketPrices.copper || ''}" dir="ltr">
            <label>⚙️ آلومینیوم (تومان/کیلو):</label>
            <input type="text" id="editAluminum" class="admin-input" value="${marketPrices.aluminum || ''}" dir="ltr">
            <button class="admin-save-btn" id="btnSaveMarket" style="margin-top:12px">💾 ذخیره</button>
        </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    function closeModal() { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); }
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    box.querySelector('.glass-modal-close').onclick = closeModal;
    box.querySelector('#btnSaveMarket').onclick = () => {
        marketPrices.dollar   = document.getElementById('editDollar').value;
        marketPrices.gold     = document.getElementById('editGold').value;
        marketPrices.copper   = document.getElementById('editCopper').value;
        marketPrices.aluminum = document.getElementById('editAluminum').value;
        marketPrices.lastUpdate = nowJalali();
        saveMarketPrices();
        updateMarketDisplay();
        closeModal();
    };
}

/* ---------------------------------------------------------------
   سیستم ناوبری
--------------------------------------------------------------- */
const navHistory = [];
let currentView = { type: 'home' };
const pageContainer = document.getElementById('page-container');
const btnHome = document.getElementById('btnHome');
const btnBack = document.getElementById('btnBack');

function navigateTo(view) {
    navHistory.push(currentView);
    currentView = view;
    renderCurrentView(true);
}

function navigateBack() {
    if (navHistory.length === 0) { currentView = { type: 'home' }; }
    else { currentView = navHistory.pop(); }
    renderCurrentView(false);
}

function navigateHome() {
    navHistory.length = 0;
    currentView = { type: 'home' };
    renderCurrentView(false);
}

function updateBackButtonVisibility() {
    if (currentView.type === 'home') btnBack.classList.add('hidden');
    else btnBack.classList.remove('hidden');
}

function renderCurrentView(forward) {
    const oldPage = pageContainer.querySelector('.page');
    function doRender() {
        pageContainer.innerHTML = '';
        let pageEl;
        switch (currentView.type) {
            case 'home':     pageEl = renderHomePage(); break;
            case 'group':    pageEl = renderGroupPage(currentView.groupId); break;
            case 'subgroup': pageEl = renderSubgroupPage(currentView.groupId, currentView.subgroupId); break;
            case 'product':  pageEl = renderProductPage(currentView.groupId, currentView.subgroupId, currentView.productId); break;
            case 'cart':     pageEl = renderCartPage(); break;
            case 'admin':    pageEl = renderAdminPage(); break;
            case 'history':  pageEl = renderHistoryPage(); break;
            default:         pageEl = renderHomePage();
        }
        pageContainer.appendChild(pageEl);
        updateBackButtonVisibility();
        window.scrollTo(0, 0);
        startClock();
    }
    if (oldPage) { oldPage.classList.add('exit'); setTimeout(doRender, 220); }
    else doRender();
}

/* ---------------------------------------------------------------
   صفحه اول (Home)
--------------------------------------------------------------- */
function renderHomePage() {
    const page = document.createElement('div');
    page.className = 'page page-home';

    /* نوار تاریخ/ساعت + مصوبه - بهبود یافته */
    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `
        <div class="clock-bar-inner">
            <div class="clock-mosavebeh-wrap">
                <span class="clock-mosavebeh-label">مصوبه</span>
                <span class="clock-mosavebeh-val">${CATALOG_DATA.meta.mosavebeh || '—'}</span>
            </div>
            <div class="clock-time-wrap">
                <span id="liveClock">${nowJalali()}</span>
            </div>
        </div>
    `;
    page.appendChild(clockBar);

    /* عنوان */
    const header = document.createElement('div');
    header.className = 'home-header';
    let clickCount = 0, clickTimer = null;
    header.onclick = () => {
        clickCount++;
        clearTimeout(clickTimer);
        if (clickCount === 5) { navigateTo({ type: 'admin' }); clickCount = 0; }
        clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
    };
    header.innerHTML = `
        <h1 class="catalog-title">کاتالوگ هوشمند <span class="brand-name">اتروپارس</span></h1>
        <p class="catalog-subtitle">صنایع الکتریک اترو تجارت پانیذ پارسیا</p>
        <button class="manual-sync-btn" id="manualSyncBtn" title="دریافت آخرین تغییرات">🔄 بروزرسانی</button>
    `;
    page.appendChild(header);

    setTimeout(() => {
        document.getElementById('manualSyncBtn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            const btn = document.getElementById('manualSyncBtn');
            btn.textContent = '⏳ در حال دریافت...';
            const ok = await loadFromSupabase();
            if (ok) {
                applyTheme();
                saveCatalog();
                renderCurrentView(false);
            } else {
                btn.textContent = '❌ خطا - دوباره امتحان کنید';
                setTimeout(() => { btn.textContent = '🔄 بروزرسانی'; }, 2000);
            }
        });
    }, 50);

    /* قیمت‌های بازار - فقط آنلاین، ویرایش فقط از پنل مدیریت */
    renderMarketBar(page);

    /* دکمه‌های جشنواره و تماس کنار هم */
    const homeActions = document.createElement('div');
    homeActions.className = 'home-action-row';

    const festivalBtn = document.createElement('button');
    festivalBtn.className = 'festival-btn';
    festivalBtn.innerHTML = `🎉 جشنواره`;
    festivalBtn.onclick = openFestivalModal;

    const contactBtn = document.createElement('button');
    contactBtn.className = 'contact-home-btn';
    contactBtn.innerHTML = `📞 مدیر بازرگانی`;
    contactBtn.onclick = openContactModal;

    homeActions.appendChild(festivalBtn);
    homeActions.appendChild(contactBtn);
    page.appendChild(homeActions);

    /* گروه‌ها */
    const groupsGrid = document.createElement('div');
    groupsGrid.className = 'groups-grid';
    CATALOG_DATA.groups.forEach(group => {
        const card = document.createElement('div');
        card.className = 'group-card';
        const iconHtml = (group.icon && group.icon.trim())
            ? `<img src="${group.icon}" alt="${group.title}" class="group-icon">`
            : `<span class="group-icon-emoji">📦</span>`;
        card.innerHTML = `
            <div class="group-icon-wrap">${iconHtml}</div>
            <div class="group-title">${group.title}</div>
        `;
        card.onclick = () => navigateTo({ type: 'group', groupId: group.id });
        groupsGrid.appendChild(card);
    });
    page.appendChild(groupsGrid);

    const footer = document.createElement('div');
    footer.className = 'home-footer';
    footer.innerHTML = `
        <div class="designer-credit-wrap">
            <p class="designer-credit-label">طراحی و توسعه</p>
            <p class="designer-company">روشن پارس</p>
            <p class="designer-name-small">مهندس روح اله روشنی</p>
        </div>
    `;
    page.appendChild(footer);

    return page;
}

/* ---------------------------------------------------------------
   صفحه گروه
--------------------------------------------------------------- */
function renderGroupPage(groupId) {
    const group = CATALOG_DATA.groups.find(g => g.id === groupId);
    const page = document.createElement('div');
    page.className = 'page';
    if (!group) { page.innerHTML = '<p>گروه یافت نشد.</p>'; return page; }

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<span id="liveClock">${nowJalali()}</span>`;
    page.appendChild(clockBar);

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = group.title;
    page.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'groups-grid sub-grid';

    if (group.hasSubgroups) {
        (group.subgroups || []).forEach(sub => {
            const card = document.createElement('div');
            card.className = 'group-card sub-card';
            const iconHtml = (sub.icon && sub.icon.trim())
                ? `<img src="${sub.icon}" alt="${sub.title}" class="group-icon">`
                : `<span class="group-icon-emoji">📂</span>`;
            card.innerHTML = `<div class="group-icon-wrap">${iconHtml}</div><div class="group-title">${sub.title}</div>`;
            card.onclick = () => navigateTo({ type: 'subgroup', groupId: group.id, subgroupId: sub.id });
            grid.appendChild(card);
        });
    } else {
        (group.products || []).forEach(prod => {
            const card = document.createElement('div');
            card.className = 'group-card sub-card';
            const iconHtml = (prod.image1 && prod.image1.trim())
                ? `<img src="${prod.image1}" alt="${prod.name}" class="group-icon">`
                : `<span class="group-icon-emoji">🔌</span>`;
            card.innerHTML = `<div class="group-icon-wrap">${iconHtml}</div><div class="group-title">${prod.name}</div>`;
            card.onclick = () => navigateTo({ type: 'product', groupId: group.id, subgroupId: null, productId: prod.id });
            grid.appendChild(card);
        });
    }
    page.appendChild(grid);
    return page;
}

/* ---------------------------------------------------------------
   صفحه زیرگروه
--------------------------------------------------------------- */
function renderSubgroupPage(groupId, subgroupId) {
    const group = CATALOG_DATA.groups.find(g => g.id === groupId);
    const sub = group ? (group.subgroups || []).find(s => s.id === subgroupId) : null;
    const page = document.createElement('div');
    page.className = 'page';
    if (!group || !sub) { page.innerHTML = '<p>زیرگروه یافت نشد.</p>'; return page; }

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<span id="liveClock">${nowJalali()}</span>`;
    page.appendChild(clockBar);

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = sub.title;
    page.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'groups-grid sub-grid';
    (sub.products || []).forEach(prod => {
        const card = document.createElement('div');
        card.className = 'group-card sub-card';
        const iconHtml = (prod.image1 && prod.image1.trim())
            ? `<img src="${prod.image1}" alt="${prod.name}" class="group-icon">`
            : `<span class="group-icon-emoji">🔌</span>`;
        card.innerHTML = `<div class="group-icon-wrap">${iconHtml}</div><div class="group-title">${prod.name}</div>`;
        card.onclick = () => navigateTo({ type: 'product', groupId: group.id, subgroupId: sub.id, productId: prod.id });
        grid.appendChild(card);
    });
    page.appendChild(grid);
    return page;
}

/* ---------------------------------------------------------------
   صفحه محصول
--------------------------------------------------------------- */
function renderProductPage(groupId, subgroupId, productId) {
    const product = findProductById(groupId, subgroupId, productId);
    const page = document.createElement('div');
    page.className = 'page page-product';
    if (!product) { page.innerHTML = '<p>محصول یافت نشد.</p>'; return page; }

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<div class="clock-bar-inner"><div class="clock-time-wrap"><span id="liveClock">${nowJalali()}</span></div></div>`;
    page.appendChild(clockBar);

    /* دو عکس تمام عرض با قابلیت زوم */
    function buildImageCard(src, label) {
        const card = document.createElement('div');
        card.className = 'product-image-card';
        if (src && src.trim() !== '') {
            const img = document.createElement('img');
            img.src = src;
            img.alt = label;
            img.className = 'product-image';
            img.onerror = () => { img.style.display = 'none'; };
            // زوم با کلیک
            img.onclick = () => openImageZoom(src, label);
            img.style.cursor = 'zoom-in';
            card.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'product-image-placeholder';
            placeholder.textContent = '📷';
            card.appendChild(placeholder);
        }
        const lbl = document.createElement('span');
        lbl.className = 'image-label';
        lbl.textContent = label;
        card.appendChild(lbl);
        return card;
    }

    const imagesWrap = document.createElement('div');
    imagesWrap.className = 'product-images';
    imagesWrap.appendChild(buildImageCard(product.image1, 'محصول'));
    imagesWrap.appendChild(buildImageCard(product.image2, 'بسته‌بندی'));
    page.appendChild(imagesWrap);

    const nameEl = document.createElement('h2');
    nameEl.className = 'product-name';
    nameEl.textContent = product.name;
    page.appendChild(nameEl);

    const descEl = document.createElement('p');
    descEl.className = 'product-description';
    descEl.textContent = (product.description || '').trim() || 'توضیحات این محصول به‌زودی تکمیل می‌شود.';
    page.appendChild(descEl);

    /* لینک اشتراک‌گذاری */
    const shareWrap = document.createElement('div');
    shareWrap.className = 'product-share-wrap';
    const shareBtn = document.createElement('button');
    shareBtn.className = 'product-share-btn';
    shareBtn.innerHTML = '🔗 اشتراک‌گذاری این محصول';
    shareBtn.onclick = () => {
        const shareText = `${product.name}\n${product.description || ''}\nقیمت: ${formatPrice(product.price)} ریال\n\nکاتالوگ اتروپارس`;
        if (navigator.share) {
            navigator.share({ title: product.name, text: shareText });
        } else {
            navigator.clipboard?.writeText(shareText).then(() => alert('✅ لینک کپی شد!'));
        }
    };
    shareWrap.appendChild(shareBtn);
    page.appendChild(shareWrap);

    /* چهار دکمه اقدام - آیکون‌های اروپایی */
    const actionsRow = document.createElement('div');
    actionsRow.className = 'product-actions';

    const buttons = [
        { icon: '◈', label: 'رنگ‌ها', cls: '', fn: () => openColorModal(product) },
        { icon: '◉', label: 'تماس',   cls: '', fn: () => openContactModal() },
        { icon: '◎', label: 'قیمت',   cls: '', fn: () => openPriceModal(product) },
        { icon: '◆', label: 'سفارش',  cls: 'action-btn-order', fn: () => openOrderModal(product) },
    ];
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = `action-btn ${b.cls}`;
        btn.innerHTML = `<span class="action-icon">${b.icon}</span><span class="action-label">${b.label}</span>`;
        btn.onclick = b.fn;
        actionsRow.appendChild(btn);
    });
    page.appendChild(actionsRow);

    return page;
}

/* ---------------------------------------------------------------
   زوم عکس
--------------------------------------------------------------- */
function openImageZoom(src, label) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;cursor:zoom-out';
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width:96vw;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.5)';
    const lbl = document.createElement('p');
    lbl.textContent = label;
    lbl.style.cssText = 'color:rgba(255,255,255,0.7);font-size:13px;font-family:var(--font-persian);margin:0';
    overlay.appendChild(img);
    overlay.appendChild(lbl);
    document.body.appendChild(overlay);
    overlay.onclick = () => overlay.remove();
}

/* ---------------------------------------------------------------
   تابع کمکی: پیدا کردن محصول
--------------------------------------------------------------- */
function findProductById(groupId, subgroupId, productId) {
    const group = CATALOG_DATA.groups.find(g => g.id === groupId);
    if (!group) return null;
    if (group.hasSubgroups) {
        if (subgroupId) {
            const sub = (group.subgroups || []).find(s => s.id === subgroupId);
            if (!sub) return null;
            return (sub.products || []).find(p => p.id === productId) || null;
        }
        for (const sub of (group.subgroups || [])) {
            const found = (sub.products || []).find(p => p.id === productId);
            if (found) return found;
        }
        return null;
    }
    return (group.products || []).find(p => p.id === productId) || null;
}

/* ---------------------------------------------------------------
   مودال جشنواره
--------------------------------------------------------------- */
function openFestivalModal() {
    const text = (CATALOG_DATA.meta.festival || '').trim();
    showModal('🎉 جشنواره و تخفیف‌های ویژه',
        text ? `<p class="festival-text">${text}</p>`
             : `<p class="festival-empty">در حال حاضر جشنواره فعالی وجود ندارد.</p>`
    );
}

/* ---------------------------------------------------------------
   مودال اطلاعات تماس
--------------------------------------------------------------- */
function openContactModal() {
    const name  = CATALOG_DATA.meta.contactName  || 'مهندس روشنی';
    const title = CATALOG_DATA.meta.contactTitle || 'مدیر بازرگانی';
    const phone = CATALOG_DATA.meta.contactPhone  || '09153063083';
    const wa    = CATALOG_DATA.meta.contactWhatsapp || '989153063083';
    showModal('📞 ارتباط با ما', `
        <p class="contact-text">ارتباط با ${title}<br><strong>${name}</strong></p>
        <a href="https://wa.me/${wa}" target="_blank" class="contact-whatsapp-btn">📱 ${phone}</a>
    `);
}

/* ---------------------------------------------------------------
   مودال قیمت
--------------------------------------------------------------- */
function openPriceModal(product) {
    const body = (!product.price || product.price <= 0)
        ? `<p class="festival-empty">قیمت این محصول به‌زودی اعلام می‌شود.</p>`
        : `<p class="price-value">${formatPrice(product.price)}</p><p class="price-unit">ریال</p>`;
    showModal('💰 قیمت محصول', body);
}

/* ---------------------------------------------------------------
   مودال رنگ
--------------------------------------------------------------- */
function openColorModal(product) {
    const colorDefs = {
        mahtabi: { label: 'مهتابی', swatch: '#f5f3e7' },
        aftabi:  { label: 'آفتابی', swatch: '#ffd98a' },
        nojral:  { label: 'نچرال',  swatch: '#e0d8c8' },
        black:   { label: 'مشکی',   swatch: '#222222' },
        colored: { label: 'رنگی',   swatch: 'linear-gradient(135deg,#ff4444,#4488ff,#ffd700)' }
    };
    let body = '';
    if (!product.colors || product.colorType === 'none') {
        body = `<p class="festival-empty">این محصول دارای گزینه رنگ‌بندی نیست.</p>`;
    } else {
        const active = Object.keys(product.colors).filter(k => product.colors[k]);
        if (!active.length) {
            body = `<p class="festival-empty">رنگ‌بندی هنوز مشخص نشده است.</p>`;
        } else {
            body = `<div class="color-options">${active.map(k => {
                const c = colorDefs[k]; if (!c) return '';
                return `<div class="color-option"><span class="color-swatch" style="background:${c.swatch}"></span><span class="color-name">${c.label}</span></div>`;
            }).join('')}</div>`;
        }
    }
    showModal('🎨 رنگ‌های موجود', body);
}

/* ---------------------------------------------------------------
   تابع کمکی: showModal
--------------------------------------------------------------- */
function showModal(title, bodyHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const box = document.createElement('div');
    box.className = 'glass-modal';
    box.innerHTML = `
        <div class="glass-modal-header">
            <span class="glass-modal-title">${title}</span>
            <button class="glass-modal-close">✕</button>
        </div>
        <div class="glass-modal-body">${bodyHtml}</div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    function closeModal() { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); }
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    box.querySelector('.glass-modal-close').onclick = closeModal;
    return { overlay, box, closeModal };
}

/* ---------------------------------------------------------------
   مودال فرم سفارش
--------------------------------------------------------------- */
function openOrderModal(product) {
    const colorDefs = [
        { key: 'mahtabi', label: 'مهتابی', swatch: '#f5f3e7' },
        { key: 'aftabi',  label: 'آفتابی', swatch: '#ffd98a' },
        { key: 'nojral',  label: 'نچرال',  swatch: '#e0d8c8' },
        { key: 'black',   label: 'مشکی',   swatch: '#222222' },
        { key: 'colored', label: 'رنگی',   swatch: 'linear-gradient(135deg,#f44,#44f,#ff0)' }
    ];
    const activeColors = product.colors
        ? Object.keys(product.colors).filter(k => product.colors[k])
        : [];
    const colorHtml = activeColors.length
        ? `<div class="order-field">
            <label>رنگ:</label>
            <div class="order-color-opts" id="orderColorOpts">
                ${activeColors.map(k => {
                    const c = colorDefs.find(d => d.key === k);
                    if (!c) return '';
                    return `<button class="order-color-btn" data-key="${k}" style="background:${c.swatch}">
                        <span>${c.label}</span>
                    </button>`;
                }).join('')}
            </div>
           </div>`
        : '';

    const overlay = document.createElement('div');
    overlay.className = 'glass-modal-overlay';
    const box = document.createElement('div');
    box.className = 'glass-modal';
    box.innerHTML = `
        <div class="modal-header">
            <h3>سفارش ${product.name}</h3>
            <button class="glass-modal-close">✕</button>
        </div>
        <div class="modal-body">
            ${colorHtml}
            <div class="order-field">
                <label>تعداد (عدد):</label>
                <input type="number" id="orderQty" class="order-input" value="1" min="1">
            </div>
            <div class="order-field">
                <label>تعداد کارتن:</label>
                <input type="number" id="orderCarton" class="order-input" value="0" min="0">
            </div>
            <div class="order-info">
                <p>تعداد در کارتن: <strong>${product.cartonQty || 'تعریف نشده'}</strong></p>
                <p>قیمت واحد: <strong>${formatPrice(product.price)} ریال</strong></p>
                <p>جمع: <strong id="orderTotal">0</strong> ریال</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="modal-btn-confirm">✅ اضافه به سبد</button>
            <button class="modal-btn-cancel">❌ انصراف</button>
        </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    let selectedColor = activeColors.length === 1 ? activeColors[0] : '';

    // انتخاب رنگ
    box.querySelectorAll('.order-color-btn').forEach(btn => {
        if (selectedColor === btn.dataset.key) btn.classList.add('selected');
        btn.onclick = () => {
            box.querySelectorAll('.order-color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.dataset.key;
        };
    });

    const qtyInput    = box.querySelector('#orderQty');
    const cartonInput = box.querySelector('#orderCarton');
    const totalEl     = box.querySelector('#orderTotal');

    function calc() {
        const qty = parseInt(toEnDigits(qtyInput.value)) || 0;
        cartonInput.value = Math.ceil(qty / (product.cartonQty || 1));
        totalEl.textContent = formatPrice(qty * product.price);
    }
    qtyInput.addEventListener('input', calc);
    cartonInput.addEventListener('input', () => {
        const c = parseInt(toEnDigits(cartonInput.value)) || 0;
        qtyInput.value = c * (product.cartonQty || 1);
        calc();
    });

    function closeModal() { overlay.remove(); }
    box.querySelector('.glass-modal-close').onclick = closeModal;
    box.querySelector('.modal-btn-cancel').onclick   = closeModal;
    box.querySelector('.modal-btn-confirm').onclick  = () => {
        const qty    = parseInt(toEnDigits(qtyInput.value)) || 0;
        const carton = parseInt(toEnDigits(cartonInput.value)) || 0;
        if (qty <= 0) { alert('⚠️ تعداد باید بیشتر از ۰ باشد!'); return; }
        if (activeColors.length > 0 && !selectedColor) { alert('⚠️ لطفاً رنگ را انتخاب کنید!'); return; }
        addToCart(product, qty, carton, selectedColor);
        closeModal();
    };
    overlay.onclick = e => { if (e.target === overlay) closeModal(); };
    calc();
}

/* ---------------------------------------------------------------
   سبد خرید
--------------------------------------------------------------- */
let cartItems = [];

function loadCart() {
    const saved = localStorage.getItem('catalog_cart');
    if (saved) { try { cartItems = JSON.parse(saved); } catch(e) { cartItems = []; } }
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('catalog_cart', JSON.stringify(cartItems));
    updateCartBadge();
}

function addToCart(product, quantity, carton, selectedColor) {
    const colorLabels = { mahtabi:'مهتابی', aftabi:'آفتابی', nojral:'نچرال', black:'مشکی', colored:'رنگی' };
    cartItems.push({
        productId:   product.id,
        productName: product.name,
        price:       product.price,
        quantity,
        carton:      carton || 0,
        cartonQty:   product.cartonQty || 0,
        total:       quantity * product.price,
        color:       selectedColor || '',
        colorLabel:  selectedColor ? (colorLabels[selectedColor] || selectedColor) : ''
    });
    saveCart();
    alert(`✅ ${product.name} اضافه شد!\nتعداد: ${quantity} عدد | کارتن: ${carton}${selectedColor ? ' | رنگ: ' + (colorLabels[selectedColor]||selectedColor) : ''}`);
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const total = cartItems.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = total;
    badge.classList.toggle('empty', total === 0);
}

/* ---------------------------------------------------------------
   اتصال به Supabase - ذخیره و بارگذاری آنلاین
--------------------------------------------------------------- */
const SUPABASE_URL = 'https://uxihvdgtlfygmbipbiej.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aWh2ZGd0bGZ5Z21iaXBiaWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjY2NTE4MCwiZXhwIjoyMDk4MjQxMTgwfQ.EDq_Q76uYQUtaKSjy7EpLNdrdKv-dE4uxtW-rvw2br0';

async function supabaseFetch(method, body) {
    try {
        const url = method === 'GET'
            ? `${SUPABASE_URL}/rest/v1/catalog?select=key,value`
            : `${SUPABASE_URL}/rest/v1/catalog`;
        const res = await fetch(url, {
            method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': method === 'POST' ? 'resolution=merge-duplicates' : ''
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            const err = await res.text();
            console.error('❌ Supabase HTTP error:', res.status, err);
            window.__lastSupabaseError = `${res.status}: ${err}`;
            return null;
        }
        const result = method === 'GET' ? await res.json() : true;
        console.log(`✅ Supabase ${method} success:`, method === 'GET' ? result.length + ' rows' : 'saved');
        return result;
    } catch(e) {
        console.error('❌ Supabase fetch error:', e);
        window.__lastSupabaseError = e.message;
        return null;
    }
}

/* ذخیره روی Supabase - UPSERT (نه POST تکراری) */
async function saveToSupabase() {
    const meta   = JSON.stringify(CATALOG_DATA.meta);
    const groups = JSON.stringify(CATALOG_DATA.groups);

    // برای هر کلید: اگه هست PATCH، اگه نیست POST
    async function upsertKey(key, value) {
        // اول چک می‌کنیم وجود داره یا نه
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/catalog?key=eq.${key}&select=key`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const existing = await checkRes.json();

        if (existing && existing.length > 0) {
            // PATCH - آپدیت ردیف موجود
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/catalog?key=eq.${key}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value, updated_at: new Date().toISOString() })
                }
            );
            return res.ok;
        } else {
            // POST - ایجاد ردیف جدید
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/catalog`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ key, value })
                }
            );
            return res.ok;
        }
    }

    try {
        const [r1, r2] = await Promise.all([
            upsertKey('meta', meta),
            upsertKey('groups', groups)
        ]);
        const ok = r1 && r2;
        console.log(ok ? '✅ Supabase UPSERT موفق' : '❌ Supabase UPSERT ناموفق');
        return ok;
    } catch(e) {
        console.error('❌ saveToSupabase error:', e);
        window.__lastSupabaseError = e.message;
        return false;
    }
}

/* بارگذاری از Supabase - جایگزینی کامل بر اساس id */
async function loadFromSupabase() {
    const rows = await supabaseFetch('GET');
    if (!rows || !rows.length) return false;
    try {
        const metaRow   = rows.find(r => r.key === 'meta');
        const groupsRow = rows.find(r => r.key === 'groups');

        if (metaRow) {
            const newMeta = JSON.parse(metaRow.value);
            Object.assign(CATALOG_DATA.meta, newMeta);
        }

        if (groupsRow) {
            const loadedGroups = JSON.parse(groupsRow.value);
            _smartMergeGroups(loadedGroups);
        }

        // ذخیره در localStorage برای استفاده آفلاین
        try {
            localStorage.setItem('catalog_data', JSON.stringify(CATALOG_DATA));
        } catch(e) { console.warn('localStorage save failed:', e); }

        return true;
    } catch(e) {
        console.warn('❌ loadFromSupabase parse error:', e);
        return false;
    }
}

/* ادغام هوشمند گروه‌ها بر اساس id - جایگزینی کامل نه سطحی */
function _smartMergeGroups(loadedGroups) {
    loadedGroups.forEach(lg => {
        // پیدا کردن گروه بر اساس id
        const gi = CATALOG_DATA.groups.findIndex(g => g.id === lg.id);

        if (gi !== -1) {
            const g = CATALOG_DATA.groups[gi];
            // جایگزینی کامل فیلدهای گروه
            if (lg.title !== undefined) g.title = lg.title;
            if (lg.icon  !== undefined) g.icon  = lg.icon;

            if (g.hasSubgroups && lg.subgroups) {
                lg.subgroups.forEach(ls => {
                    const si = (g.subgroups||[]).findIndex(s => s.id === ls.id);
                    if (si !== -1) {
                        if (ls.title !== undefined) g.subgroups[si].title = ls.title;
                        if (ls.icon  !== undefined) g.subgroups[si].icon  = ls.icon;
                        if (ls.products) {
                            _smartMergeProducts(g.subgroups[si], ls.products);
                        }
                    } else {
                        if (!g.subgroups) g.subgroups = [];
                        g.subgroups.push(ls);
                    }
                });
            } else if (!g.hasSubgroups && lg.products) {
                _smartMergeProducts(g, lg.products);
            }
        } else {
            // گروه جدید
            CATALOG_DATA.groups.push(lg);
        }
    });
}

/* ادغام هوشمند محصولات بر اساس id */
function _smartMergeProducts(group, loadedProducts) {
    loadedProducts.forEach(lp => {
        const pi = (group.products||[]).findIndex(p => p.id === lp.id);
        if (pi !== -1) {
            // جایگزینی کامل همه فیلدها
            const target = group.products[pi];
            if (lp.name            !== undefined) target.name            = lp.name;
            if (lp.price           !== undefined) target.price           = lp.price;
            if (lp.discountPercent !== undefined) target.discountPercent = lp.discountPercent;
            if (lp.cartonQty       !== undefined) target.cartonQty       = lp.cartonQty;
            if (lp.description     !== undefined) target.description     = lp.description;
            if (lp.image1          !== undefined) target.image1          = lp.image1;
            if (lp.image2          !== undefined) target.image2          = lp.image2;
            if (lp.colorType       !== undefined) target.colorType       = lp.colorType;
            if (lp.colors          !== undefined) target.colors          = { ...lp.colors };
        } else {
            // محصول جدید
            if (!group.products) group.products = [];
            group.products.push(lp);
        }
    });
}

function saveCatalog() {
    // ذخیره محلی
    try {
        localStorage.setItem('catalog_data', JSON.stringify(CATALOG_DATA));
    } catch(e) {
        if (e.name === 'QuotaExceededError') alert('⚠️ حافظه مرورگر پر است.');
    }
    // ذخیره آنلاین با اطلاع‌رسانی
    saveToSupabase().then(ok => {
        if (!ok) {
            console.error('❌ ذخیره آنلاین ناموفق:', window.__lastSupabaseError);
        }
    });
}

function loadCatalog() {
    if (navigator.onLine) {
        // اول از Supabase (اولویت اصلی - آخرین نسخه)
        loadFromSupabase().then(ok => {
            if (ok) {
                applyTheme();
                renderCurrentView(false);
                console.log('✅ بارگذاری از Supabase موفق');
            } else {
                // fallback به localStorage
                console.warn('⚠️ Supabase ناموفق، از localStorage استفاده می‌شود');
                _loadFromLocalStorage();
            }
        });
    } else {
        // آفلاین - از localStorage
        _loadFromLocalStorage();
    }
}

function _loadFromLocalStorage() {
    const saved = localStorage.getItem('catalog_data');
    if (!saved) return;
    try {
        const loaded = JSON.parse(saved);
        if (loaded.meta)   Object.assign(CATALOG_DATA.meta, loaded.meta);
        if (loaded.groups) _smartMergeGroups(loaded.groups);
    } catch(e) { console.log('localStorage error:', e); }
}

/* توابع قدیمی _mergeGroups و _mergeProduct حذف شدند - جایگزین شدند با _smartMergeGroups و _smartMergeProducts */

function applyTheme() {
    const p   = CATALOG_DATA.meta.themePrimary      || '#d10000';
    const pd  = CATALOG_DATA.meta.themePrimaryDark  || '#a30000';
    const pl  = CATALOG_DATA.meta.themePrimaryLight || '#ff4444';
    const ib  = CATALOG_DATA.meta.themeImgBorder    || '#000000';
    const bgC = CATALOG_DATA.meta.themeBgColor      || '';
    const bgI = CATALOG_DATA.meta.themeBgImage      || '';
    document.documentElement.style.setProperty('--color-primary',       p);
    document.documentElement.style.setProperty('--color-primary-dark',  pd);
    document.documentElement.style.setProperty('--color-primary-light', pl);
    document.documentElement.style.setProperty('--color-img-border',    ib);
    // اعمال پس‌زمینه با priority بالا
    if (bgI) {
        document.body.setAttribute('style', `background: url(${bgI}) center/cover fixed !important`);
    } else if (bgC) {
        document.body.setAttribute('style', `background: ${bgC} !important`);
    } else {
        document.body.removeAttribute('style');
    }
}

/* loadCatalog در بالا تعریف شده */

loadCatalog();
applyTheme();
loadCart();

/* ---------------------------------------------------------------
   محاسبات سبد
--------------------------------------------------------------- */
function getItemDiscount(productId) {
    for (const group of CATALOG_DATA.groups) {
        const list = group.hasSubgroups
            ? (group.subgroups || []).flatMap(s => s.products || [])
            : (group.products || []);
        const prod = list.find(p => p.id === productId);
        if (prod) return prod.discountPercent || 0;
    }
    return 0;
}

function calcCartBase() {
    return cartItems.reduce((t, item) => {
        const disc = getItemDiscount(item.productId);
        return t + item.quantity * item.price * (1 - disc / 100);
    }, 0);
}

/* ---------------------------------------------------------------
   ساخت متن فاکتور کامل
--------------------------------------------------------------- */
function buildOrderMessage(custName, custPhone, shipInfo) {
    custName  = custName  || '';
    custPhone = custPhone || '';

    const agentPercent    = toNormalNum(document.getElementById('agentVal')?.value || 0);
    const activeType      = document.querySelector('.settle-type-btn.active')?.dataset?.type || 'nagdi';
    const activeSubType   = document.querySelector('.settle-sub-btn.active')?.id || 'subPishVariz';
    const totalBase       = calcCartBase();
    const totalQty        = cartItems.reduce((s,i) => s + i.quantity, 0);
    const totalCarton     = cartItems.reduce((s,i) => s + i.carton, 0);
    const totalAfterAgent = totalBase * (1 - agentPercent / 100);
    let finalAmount = totalAfterAgent;
    let settleLines = '';

    if (activeType === 'nagdi') {
        if (activeSubType === 'subPishVariz') {
            const pv = toNormalNum(document.getElementById('pishVarizVal')?.value || CATALOG_DATA.meta.pishVarizPercent || 0);
            finalAmount = totalAfterAgent * (1 - pv / 100);
            settleLines = `💳 تسویه: نقدی - پیش‌واریز | تخفیف: ${pv}% = ${formatPrice(totalAfterAgent - finalAmount)} ریال`;
        } else {
            const bp = toNormalNum(document.getElementById('barDiscountVal')?.value || CATALOG_DATA.meta.barPercent || 0);
            const bd = toNormalNum(document.getElementById('barDaysVal')?.value || CATALOG_DATA.meta.barDays || 7);
            finalAmount = totalAfterAgent * (1 - bp / 100);
            settleLines = `💳 تسویه: نقدی بعد از بار | ${bp}% | ${bd} روز | ${formatPrice(totalAfterAgent - finalAmount)} ریال`;
        }
        const accs = CATALOG_DATA.meta.bankAccounts || [];
        if (accs.length) {
            settleLines += '\n🏦 حساب‌ها:\n';
            accs.forEach(a => {
                settleLines += `${a.holder ? a.holder+' | ' : ''}${a.bank}: ${a.account}${a.sheba ? ' | '+a.sheba : ''}\n`;
            });
        }
    } else {
        const cd  = toNormalNum(document.getElementById('chekiDaysVal')?.value || CATALOG_DATA.meta.chekiDays || 60);
        const nat = document.getElementById('chekiNatCode')?.value   || '—';
        const own = document.getElementById('chekiOwnerName')?.value || '—';
        const chkDate = addDaysJalali(cd);
        settleLines = `📝 چکی | ${chkDate} | کدملی: ${nat} | ${own}\n✍️ مبلغ ${formatPrice(finalAmount)} ریال تاریخ ${chkDate} کدملی ${nat} آقای/خانم ${own}`;
    }

    if (!shipInfo) shipInfo = getShippingInfo(totalCarton);
    const shipLine = shipInfo.range.percent === 0 ? '🚚 کرایه: با مشتری'
        : shipInfo.range.percent === 100 ? '🚚 کرایه: با شرکت ✅'
        : `🚚 کرایه: ${shipInfo.range.percent}% با شرکت`;

    const L  = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const SL = '──────────────────────────────';
    let msg = `🧾 *پیش‌فاکتور - اتروپارس*\n${L}\n`;
    msg += `📋 مصوبه: *${CATALOG_DATA.meta.mosavebeh || '—'}* | ⏰ ${nowJalali()}\n`;
    if (custName)  msg += `👤 *${custName}*`;
    if (custPhone) msg += `  📞 ${custPhone}`;
    if (custName)  msg += '\n';
    msg += `${L}\n`;
    msg += `*#  |  نام کالا  |  رنگ  |  عدد  |  کارتن  |  درصد  |  قیمت  |  جمع*\n${SL}\n`;

    cartItems.forEach((item, idx) => {
        const disc      = getItemDiscount(item.productId);
        const unitPrice = item.price * (1 - disc / 100);
        const rowTotal  = item.quantity * unitPrice;
        const color     = item.colorLabel || '—';
        msg += `${idx+1} | ${item.productName} | ${color} | ${item.quantity} | ${item.carton} | ${disc}% | ${formatPrice(unitPrice)} | *${formatPrice(rowTotal)}*\n`;
    });

    msg += `${SL}\n`;
    msg += `📦 کل: ${totalQty} عدد / ${totalCarton} کارتن\n`;
    msg += `💵 جمع: ${formatPrice(totalBase)} ریال\n`;
    if (agentPercent > 0) {
        msg += `📉 نمایندگی ${agentPercent}%: -${formatPrice(totalBase - totalAfterAgent)} ریال\n`;
        msg += `← ${formatPrice(totalAfterAgent)} ریال\n`;
    }
    msg += `${SL}\n${settleLines}\n${SL}\n${shipLine}\n${L}\n`;
    msg += `✅ *مبلغ نهایی: ${formatPrice(finalAmount)} ریال*\n${L}\n`;
    if (custName) {
        msg += `\n📌 سفارش *${custName}*`;
        if (custPhone) msg += ` - ${custPhone}`;
        msg += ' قبول است.\n';
    }
    msg += `\n🙏 با سپاس - ${CATALOG_DATA.meta.contactName || 'اتروپارس'}`;
    return msg;
}

/* ---------------------------------------------------------------
   محاسبه کرایه حمل
--------------------------------------------------------------- */
function getShippingInfo(totalCarton) {
    const ranges = CATALOG_DATA.meta.shippingRanges || [
        {from:0,   to:30,  percent:0},
        {from:31,  to:50,  percent:30},
        {from:51,  to:100, percent:50},
        {from:101, to:200, percent:80},
        {from:201, to:9999,percent:100}
    ];
    for (const r of ranges) {
        if (totalCarton >= r.from && totalCarton <= r.to) {
            return { range: r, allRanges: ranges };
        }
    }
    return { range: ranges[ranges.length-1], allRanges: ranges };
}

function getNextShippingTier(totalCarton) {
    const ranges = CATALOG_DATA.meta.shippingRanges || [
        {from:0,   to:30,  percent:0},
        {from:31,  to:50,  percent:30},
        {from:51,  to:100, percent:50},
        {from:101, to:200, percent:80},
        {from:201, to:9999,percent:100}
    ];
    for (let i = 0; i < ranges.length - 1; i++) {
        if (totalCarton >= ranges[i].from && totalCarton <= ranges[i].to) {
            const next = ranges[i+1];
            const needed = next.from - totalCarton;
            return { next, needed };
        }
    }
    return null;
}

/* ---------------------------------------------------------------
   Export products.js برای آپلود GitHub
--------------------------------------------------------------- */
function exportProductsJS() {
    const data = JSON.parse(JSON.stringify(CATALOG_DATA));
    const content = `/* =====================================================================
   products.js - کاتالوگ هوشمند اتروپارس
   ورژن: ${data.meta.catalogVersion || '1.0'}
   تاریخ: ${nowJalali()}
   ===================================================================== */

const CATALOG_DATA = ${JSON.stringify(data, null, 2)};
`;
    const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'products.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
        alert(`✅ فایل products.js دانلود شد!\n\nحالا:\n۱. برید GitHub\n۲. فایل products.js قدیمی رو حذف کنید\n۳. فایل جدید رو آپلود کنید\n۴. همه مشتریان آپدیت می‌گیرن`);
    }, 500);
}

/* ---------------------------------------------------------------
   تاریخچه سفارش‌ها
--------------------------------------------------------------- */
function saveOrderToHistory(custName, custPhone, msg) {
    let history = [];
    try { history = JSON.parse(localStorage.getItem('order_history') || '[]'); } catch(e) {}
    history.unshift({
        id:       Date.now(),
        date:     nowJalali(),
        custName: custName || '—',
        custPhone:custPhone || '—',
        items:    JSON.parse(JSON.stringify(cartItems)),
        msg:      msg
    });
    // فقط ۵۰ سفارش آخر نگه می‌داریم
    if (history.length > 50) history = history.slice(0, 50);
    try { localStorage.setItem('order_history', JSON.stringify(history)); } catch(e) {}
    updateHistoryBadge();
}

function updateHistoryBadge() {
    const badge = document.getElementById('historyBadge');
    if (!badge) return;
    let history = [];
    try { history = JSON.parse(localStorage.getItem('order_history') || '[]'); } catch(e) {}
    if (history.length > 0) {
        badge.textContent = history.length;
        badge.classList.add('has-items');
    } else {
        badge.textContent = '';
        badge.classList.remove('has-items');
    }
}

function renderHistoryPage() {
    const page = document.createElement('div');
    page.className = 'page page-history';

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<span class="clock-mosavebeh">${CATALOG_DATA.meta.mosavebeh}</span><span id="liveClock">${nowJalali()}</span>`;
    page.appendChild(clockBar);

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = '📋 تاریخچه سفارش‌ها';
    page.appendChild(title);

    let history = [];
    try { history = JSON.parse(localStorage.getItem('order_history') || '[]'); } catch(e) {}

    if (!history.length) {
        const empty = document.createElement('div');
        empty.className = 'history-empty';
        empty.innerHTML = `<div class="history-empty-icon">📭</div><p>هنوز سفارشی ثبت نشده است.</p>`;
        page.appendChild(empty);
        return page;
    }

    history.forEach((order, idx) => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-card-header">
                <span class="history-card-num">سفارش #${history.length - idx}</span>
                <span class="history-card-date">${order.date}</span>
            </div>
            <div class="history-card-customer">
                <span>👤 ${order.custName}</span>
                ${order.custPhone ? `<span>📞 ${order.custPhone}</span>` : ''}
            </div>
            <div class="history-card-items">
                ${(order.items || []).map(item =>
                    `<div class="history-item-row">
                        <span>${item.productName}</span>
                        ${item.colorLabel ? `<span class="history-color">🎨 ${item.colorLabel}</span>` : ''}
                        <span>${item.quantity} عدد</span>
                        <span>${formatPrice(item.quantity * item.price)} ریال</span>
                    </div>`
                ).join('')}
            </div>
            <div class="history-card-actions">
                <button class="history-view-btn" data-idx="${idx}">👁 مشاهده فاکتور</button>
                <button class="history-del-btn" data-idx="${idx}">🗑️ حذف</button>
            </div>
        `;
        page.appendChild(card);
    });

    // دکمه پاک کردن همه
    const clearBtn = document.createElement('button');
    clearBtn.className = 'admin-save-btn';
    clearBtn.style.cssText = 'background:rgba(209,0,0,0.08);color:#d10000;margin-top:12px';
    clearBtn.textContent = '🗑️ پاک کردن همه تاریخچه';
    clearBtn.onclick = () => {
        if (confirm('همه تاریخچه پاک شود؟')) {
            localStorage.removeItem('order_history');
            updateHistoryBadge();
            renderCurrentView(false);
        }
    };
    page.appendChild(clearBtn);

    // events
    setTimeout(() => {
        page.querySelectorAll('.history-view-btn').forEach(btn => {
            btn.onclick = () => {
                const order = history[+btn.dataset.idx];
                showModal(`📄 فاکتور سفارش #${history.length - +btn.dataset.idx}`,
                    `<pre style="white-space:pre-wrap;font-family:var(--font-persian);font-size:12px;line-height:1.8;direction:rtl;text-align:right">${order.msg}</pre>`
                );
            };
        });
        page.querySelectorAll('.history-del-btn').forEach(btn => {
            btn.onclick = () => {
                if (!confirm('این سفارش حذف شود؟')) return;
                history.splice(+btn.dataset.idx, 1);
                try { localStorage.setItem('order_history', JSON.stringify(history)); } catch(e) {}
                updateHistoryBadge();
                renderCurrentView(false);
            };
        });
    }, 50);

    return page;
}
/* ---------------------------------------------------------------
   پیش‌فاکتور HTML برای چاپ / PDF
--------------------------------------------------------------- */
function openPreInvoice() {
    if (!cartItems.length) { alert('سبد خرید خالی است!'); return; }
    const agentPercent    = toNormalNum(document.getElementById('agentVal')?.value || 0);
    const activeType      = document.querySelector('.settle-type-btn.active')?.dataset?.type || 'nagdi';
    const activeSubType   = document.querySelector('.settle-sub-btn.active')?.id || 'subPishVariz';
    const totalBase       = calcCartBase();
    const totalQty        = cartItems.reduce((s,i) => s + i.quantity, 0);
    const totalCarton     = cartItems.reduce((s,i) => s + i.carton, 0);
    const totalAfterAgent = totalBase * (1 - agentPercent / 100);
    let finalAmount = totalAfterAgent;
    let settleHtml  = '';
    if (activeType === 'nagdi') {
        if (activeSubType === 'subPishVariz') {
            const pv = toNormalNum(document.getElementById('pishVarizVal')?.value || CATALOG_DATA.meta.pishVarizPercent || 0);
            finalAmount = totalAfterAgent * (1 - pv / 100);
            settleHtml = `<tr class="settle-row"><td colspan="4">💳 نقدی - پیش‌واریز (${pv}%)</td><td colspan="4" class="money">- ${formatPrice(totalAfterAgent-finalAmount)}</td></tr>`;
        } else {
            const bp = toNormalNum(document.getElementById('barDiscountVal')?.value || CATALOG_DATA.meta.barPercent || 0);
            const bd = toNormalNum(document.getElementById('barDaysVal')?.value || CATALOG_DATA.meta.barDays || 7);
            finalAmount = totalAfterAgent * (1 - bp / 100);
            settleHtml = `<tr class="settle-row"><td colspan="4">💳 نقدی بعد از بار (${bp}% / ${bd} روز)</td><td colspan="4" class="money">- ${formatPrice(totalAfterAgent-finalAmount)}</td></tr>`;
        }
    } else {
        const cd = toNormalNum(document.getElementById('chekiDaysVal')?.value || CATALOG_DATA.meta.chekiDays || 60);
        const nat = document.getElementById('chekiNatCode')?.value || '—';
        const own = document.getElementById('chekiOwnerName')?.value || '—';
        const chkDate = addDaysJalali(cd);
        settleHtml = `<tr class="settle-row"><td colspan="8">📝 تسویه چکی | تاریخ: ${chkDate} | کد ملی: ${nat} | نام: ${own}<br><small>مبلغ ${formatPrice(finalAmount)} ریال به تاریخ ${chkDate} به نام ${own}</small></td></tr>`;
    }
    const accs = (CATALOG_DATA.meta.bankAccounts||[]).map(a=>`<div>${a.holder?`<b>${a.holder}</b> | `:''}${a.bank}: <span dir="ltr">${a.account}</span></div>`).join('');
    const rows = cartItems.map((item,idx)=>{
        const disc=getItemDiscount(item.productId);
        const up=item.price*(1-disc/100);
        return `<tr><td>${idx+1}</td><td class="rt">${item.productName}</td><td>${item.colorLabel||'—'}</td><td>${item.quantity}</td><td>${item.carton}</td><td>${disc}%</td><td class="lt">${formatPrice(up)}</td><td class="lt"><b>${formatPrice(item.quantity*up)}</b></td></tr>`;
    }).join('');
    const html=`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>پیش‌فاکتور</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Tahoma,Arial,sans-serif;font-size:13px;background:#fff;color:#111;direction:rtl;padding:20px}
.wrap{max-width:820px;margin:0 auto;border:2px solid #c00;border-radius:8px;padding:20px}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c00;padding-bottom:12px;margin-bottom:14px}
.logo{font-size:20px;font-weight:900;color:#c00}.logo small{display:block;font-size:11px;color:#666;font-weight:normal}
.hdr-info{text-align:left;font-size:12px;color:#555;line-height:1.8}
.cust{background:#fff5f5;border:1px solid #fcc;border-radius:6px;padding:10px 14px;margin-bottom:14px;display:flex;gap:24px;font-size:13px}
table{width:100%;border-collapse:collapse}
th{background:#c00;color:#fff;padding:8px 5px;font-size:12px;text-align:center}
td{padding:7px 5px;text-align:center;border-bottom:1px solid #eee;font-size:12px}
td.rt{text-align:right}td.lt{text-align:left;direction:ltr;font-weight:bold}
.tr-tot td{background:#f9f9f9;font-size:13px}
.settle-row td{background:#fff5f5;color:#900;font-size:12px;text-align:right;padding:8px 10px}
.final td{background:#c00;color:#fff;font-size:15px;font-weight:900;padding:10px}
.banks{background:#f5f5f5;border:1px solid #ddd;border-radius:6px;padding:10px;margin-top:12px;font-size:12px}
.foot{margin-top:16px;border-top:1px solid #eee;padding-top:12px;display:flex;justify-content:space-between;font-size:11px;color:#888}
.btns{display:flex;gap:8px;margin-bottom:14px}
.btns button{padding:9px 18px;border:none;border-radius:7px;cursor:pointer;font-family:Tahoma;font-size:13px;font-weight:bold}
.bp{background:#c00;color:#fff}.bc{background:#eee;color:#333}
@media print{.btns{display:none!important}.wrap{border:none;padding:0}}</style></head>
<body><div class="wrap">
<div class="btns"><button class="bp" onclick="window.print()">🖨️ چاپ / PDF</button><button class="bc" onclick="window.close()">✕ بستن</button></div>
<div class="hdr"><div class="logo">روشن پارس<small>اتروپارس الکتریک</small></div>
<div class="hdr-info">مصوبه: <b>${CATALOG_DATA.meta.mosavebeh||'—'}</b><br>تاریخ: <b>${nowJalali()}</b></div></div>
<div class="cust"><div>👤 مشتری: <b>—</b></div><div>📞 تماس: <b>—</b></div></div>
<table><thead><tr><th>#</th><th>نام کالا</th><th>رنگ</th><th>عدد</th><th>کارتن</th><th>درصد</th><th>قیمت واحد (ریال)</th><th>جمع ردیف (ریال)</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot>
<tr class="tr-tot"><td colspan="3">جمع کل</td><td>${totalQty}</td><td>${totalCarton}</td><td colspan="2"></td><td class="lt">${formatPrice(totalBase)}</td></tr>
${agentPercent>0?`<tr class="tr-tot"><td colspan="7">کسر تخفیف نمایندگی (${agentPercent}%)</td><td class="lt">- ${formatPrice(totalBase-totalAfterAgent)}</td></tr>
<tr class="tr-tot"><td colspan="7">پس از تخفیف نمایندگی</td><td class="lt">${formatPrice(totalAfterAgent)}</td></tr>`:''}
${settleHtml}
<tr class="final"><td colspan="7">◆ مبلغ نهایی قابل پرداخت</td><td>${formatPrice(finalAmount)} ریال</td></tr>
</tfoot></table>
${accs?`<div class="banks"><b>🏦 شماره حساب‌ها:</b>${accs}</div>`:''}
<div class="foot"><div>${CATALOG_DATA.meta.contactName||'اتروپارس'} | ${CATALOG_DATA.meta.contactPhone||''}</div><div>روشن پارس | مهندس روح اله روشنی</div></div>
</div></body></html>`;
    const w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
    else alert('لطفاً pop-up را در مرورگر مجاز کنید.');
}

function openSendModal() {
    if (!cartItems.length) { alert('سبد خرید خالی است!'); return; }
    const m = CATALOG_DATA.meta.messengers || {};
    const opts = [];
    if (m.whatsapp) opts.push({
        label: '📱 واتساپ',
        getUrl: (msg) => `https://wa.me/${m.whatsapp}?text=${encodeURIComponent(msg)}`
    });
    if (m.telegram) opts.push({
        label: '✈️ تلگرام',
        getUrl: (msg) => `https://t.me/${m.telegram}?text=${encodeURIComponent(msg)}`
    });
    if (m.rubika) opts.push({
        label: '🔵 روبیکا',
        getUrl: (msg) => `https://rubika.ir/share?text=${encodeURIComponent(msg)}`
    });
    if (m.bale) opts.push({
        label: '🟢 بله',
        getUrl: (msg) => `https://ble.ir/send?phone=${m.bale}&text=${encodeURIComponent(msg)}`
    });
    if (!opts.length) { alert('⚠️ هیچ پیام‌رسانی در پنل مدیریت تنظیم نشده است.'); return; }

    const totalCarton = cartItems.reduce((s, i) => s + i.carton, 0);
    const shipInfo = getShippingInfo(totalCarton);
    const nextTier = getNextShippingTier(totalCarton);

    let shippingHtml = '';
    if (shipInfo.range.percent === 0) {
        shippingHtml = `<div class="shipping-notice shipping-zero">🚚 کرایه حمل: <strong>با مشتری</strong> (کمتر از ${shipInfo.range.to} کارتن)</div>`;
    } else if (shipInfo.range.percent === 100) {
        shippingHtml = `<div class="shipping-notice shipping-full">🚚 کرایه حمل: <strong>کاملاً با شرکت ✅</strong></div>`;
    } else {
        shippingHtml = `<div class="shipping-notice shipping-partial">🚚 کرایه حمل: <strong>${shipInfo.range.percent}% با شرکت</strong></div>`;
    }

    if (nextTier && nextTier.needed > 0) {
        shippingHtml += `<div class="shipping-tip">💡 اگر <strong>${nextTier.needed} کارتن</strong> دیگر اضافه کنید، کرایه <strong>${nextTier.next.percent}%</strong> با شرکت می‌شود.</div>`;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const box = document.createElement('div');
    box.className = 'glass-modal';
    box.innerHTML = `
        <div class="glass-modal-header">
            <span class="glass-modal-title">📤 ارسال سفارش</span>
            <button class="glass-modal-close">✕</button>
        </div>
        <div class="glass-modal-body">
            ${shippingHtml}
            ${nextTier && nextTier.needed > 0 ? `
            <div class="shipping-choice-btns">
                <button class="settle-sub-btn active" id="btnContinueSend">✅ ادامه می‌دهم</button>
                <button class="settle-sub-btn" id="btnBackToCart">🔙 برگشت برای اصلاح</button>
            </div>` : ''}
            <div id="sendFormSection" ${nextTier && nextTier.needed > 0 ? 'style="display:none"' : ''}>
                <div class="send-customer-fields">
                    <label>👤 نام مشتری:</label>
                    <input type="text" id="sendCustomerName" class="admin-input" placeholder="نام و نام خانوادگی">
                    <label>📞 شماره تماس:</label>
                    <input type="text" id="sendCustomerPhone" class="admin-input" placeholder="شماره موبایل" dir="ltr">
                </div>
                <p style="font-size:13px;color:#666;margin:10px 0 6px">پیام‌رسان را انتخاب کنید:</p>
                ${opts.map((o,i) => `<button class="send-messenger-btn" data-idx="${i}">${o.label}</button>`).join('')}
            </div>
        </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    function closeModal() { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); }
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    box.querySelector('.glass-modal-close').onclick = closeModal;

    box.querySelector('#btnContinueSend')?.addEventListener('click', () => {
        box.querySelector('#sendFormSection').style.display = '';
        box.querySelector('.shipping-choice-btns').style.display = 'none';
    });
    box.querySelector('#btnBackToCart')?.addEventListener('click', () => {
        closeModal();
    });

    box.querySelectorAll('.send-messenger-btn').forEach(btn => {
        btn.onclick = () => {
            const custName  = box.querySelector('#sendCustomerName')?.value.trim() || '';
            const custPhone = box.querySelector('#sendCustomerPhone')?.value.trim() || '';
            if (!custName) { alert('⚠️ لطفاً نام مشتری را وارد کنید'); return; }
            const msg = buildOrderMessage(custName, custPhone, shipInfo);
            const opt = opts[+btn.dataset.idx];
            const url = opt.getUrl(msg);
            // باز کردن پیام‌رسان - حتماً قبل از هر عملیات دیگه
            window.open(url, '_blank');
            // ذخیره و پاک کردن
            saveOrderToHistory(custName, custPhone, msg);
            cartItems = [];
            saveCart();
            closeModal();
            setTimeout(() => { navigateHome(); }, 300);
        };
    });
}

/* ---------------------------------------------------------------
   به‌روزرسانی خلاصه سبد
--------------------------------------------------------------- */
function updateCartSummary() {
    const summaryDiv = document.querySelector('.cart-summary');
    if (!summaryDiv) return;
    const totalBase    = calcCartBase();
    const totalQty     = cartItems.reduce((s, i) => s + i.quantity, 0);
    const agentPercent = toNormalNum(document.getElementById('agentVal')?.value || 0);
    const totalAfterAgent = totalBase * (1 - agentPercent / 100);
    const activeType = document.querySelector('.settle-type-btn.active')?.dataset?.type || 'nagdi';
    let finalAmount = totalAfterAgent, extraLine = '';

    if (activeType === 'nagdi') {
        const subType = document.querySelector('.settle-sub-btn.active')?.id || 'subPishVariz';
        if (subType === 'subPishVariz') {
            const pv = toNormalNum(document.getElementById('pishVarizVal')?.value || 0);
            finalAmount = totalAfterAgent * (1 - pv / 100);
            extraLine = `<p><strong>تخفیف پیش‌واریز (${pv}%):</strong> ${formatPrice(totalAfterAgent - finalAmount)} ریال</p>`;
        } else {
            const bp = toNormalNum(document.getElementById('barDiscountVal')?.value || 0);
            finalAmount = totalAfterAgent * (1 - bp / 100);
            extraLine = `<p><strong>تخفیف بعد از بار (${bp}%):</strong> ${formatPrice(totalAfterAgent - finalAmount)} ریال</p>`;
        }
    } else { extraLine = `<p><strong>نوع تسویه:</strong> چکی</p>`; }

    summaryDiv.innerHTML = `
        <p><strong>تعداد کل:</strong> ${totalQty}</p>
        <p><strong>جمع بعد از تخفیف ردیف:</strong> ${formatPrice(totalBase)} ریال</p>
        <p><strong>بعد از نمایندگی (${agentPercent}%):</strong> ${formatPrice(totalAfterAgent)} ریال</p>
        ${extraLine}
        <p class="total-final"><strong>جمع نهایی: ${formatPrice(finalAmount)} ریال</strong></p>
    `;
    updateSettleResult(totalAfterAgent, finalAmount, activeType);
}

function updateSettleResult(totalAfterAgent, finalAmount, type) {
    if (type === 'nagdi') {
        const r = document.getElementById('nagdiResult');
        if (!r) return;
        const accounts = CATALOG_DATA.meta.bankAccounts || [];
        const accHtml = accounts.length
            ? accounts.map(a => `
                <div class="bank-row">
                    ${a.holder ? `<div class="bank-holder-name">👤 ${a.holder}</div>` : ''}
                    <strong>${a.bank}:</strong> <span dir="ltr">${a.account}</span>
                    ${a.sheba ? `<br><small>شبا: ${a.sheba}</small>` : ''}
                </div>`).join('')
            : '<p style="color:#999;font-size:13px">شماره حسابی تنظیم نشده است.</p>';
        r.innerHTML = `<p class="settle-final-amount">مبلغ قابل پرداخت: <strong>${formatPrice(finalAmount)} ریال</strong></p>`;
        const bi = document.getElementById('nagdiBankInfo');
        if (bi) bi.innerHTML = `<h4 class="bank-title">🏦 شماره حساب‌ها</h4>${accHtml}`;
    } else {
        const r = document.getElementById('chekiResult');
        if (!r) return;
        const cd = toNormalNum(document.getElementById('chekiDaysVal')?.value || 60);
        const nat = document.getElementById('chekiNatCode')?.value  || '...';
        const own = document.getElementById('chekiOwnerName')?.value || '...';
        const chkDate = addDaysJalali(cd);
        r.innerHTML = `<div class="cheki-text-box">لطفاً مبلغ <strong>${formatPrice(finalAmount)} ریال</strong> را به تاریخ <strong>${chkDate}</strong> با کدملی <strong dir="ltr">${nat}</strong> آقای <strong>${own}</strong> ثبت نمایید.</div>`;
    }
}

/* ---------------------------------------------------------------
   صفحه سبد خرید
--------------------------------------------------------------- */
function renderCartPage() {
    const page = document.createElement('div');
    page.className = 'page page-cart';

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<span id="liveClock">${nowJalali()}</span>`;
    page.appendChild(clockBar);

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = 'سبد خرید';
    page.appendChild(title);

    if (!cartItems.length) {
        const empty = document.createElement('p');
        empty.className = 'cart-empty';
        empty.textContent = 'سبد خرید خالی است.';
        page.appendChild(empty);
        return page;
    }

    const table = document.createElement('div');
    table.className = 'cart-table';
    table.innerHTML = `<div class="cart-row header-row">
        <div class="cart-col col-name">نام کالا</div>
        <div class="cart-col col-color">رنگ</div>
        <div class="cart-col col-qty">تعداد</div>
        <div class="cart-col col-carton">کارتن</div>
        <div class="cart-col col-price">قیمت واحد</div>
        <div class="cart-col col-discount">درصد</div>
        <div class="cart-col col-total">جمع</div>
    </div>`;
    cartItems.forEach((item, idx) => {
        const disc = getItemDiscount(item.productId);
        const afterDisc = item.price * (1 - disc / 100);
        const row = document.createElement('div');
        row.className = 'cart-row';
        row.innerHTML = `
            <div class="cart-col col-name">${item.productName}</div>
            <div class="cart-col col-color">${item.colorLabel || '—'}</div>
            <div class="cart-col col-qty">
                <div class="qty-controls">
                    <button class="qty-btn qty-minus" data-idx="${idx}">−</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-idx="${idx}">+</button>
                </div>
            </div>
            <div class="cart-col col-carton">${item.carton}</div>
            <div class="cart-col col-price">${formatPrice(item.price)}</div>
            <div class="cart-col col-discount">${disc}%</div>
            <div class="cart-col col-total">${formatPrice(item.quantity * afterDisc)}</div>
            <div class="cart-col col-del"><button class="del-item-btn" data-idx="${idx}">🗑️</button></div>
        `;
        table.appendChild(row);
    });

    /* منطق تعداد و حذف */
    table.addEventListener('click', e => {
        const minusBtn = e.target.closest('.qty-minus');
        const plusBtn  = e.target.closest('.qty-plus');
        const delBtn   = e.target.closest('.del-item-btn');
        if (minusBtn) {
            const i = +minusBtn.dataset.idx;
            if (cartItems[i].quantity > 1) {
                cartItems[i].quantity--;
                cartItems[i].carton = Math.ceil(cartItems[i].quantity / (cartItems[i].cartonQty || 1));
            } else {
                if (!confirm('این کالا حذف شود؟')) return;
                cartItems.splice(i, 1);
            }
            saveCart(); renderCurrentView(false);
        } else if (plusBtn) {
            const i = +plusBtn.dataset.idx;
            cartItems[i].quantity++;
            cartItems[i].carton = Math.ceil(cartItems[i].quantity / (cartItems[i].cartonQty || 1));
            saveCart(); renderCurrentView(false);
        } else if (delBtn) {
            const i = +delBtn.dataset.idx;
            if (confirm(`${cartItems[i].productName} حذف شود؟`)) {
                cartItems.splice(i, 1);
                saveCart(); renderCurrentView(false);
            }
        }
    });

    page.appendChild(table);

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    page.appendChild(summary);

    const settlementDiv = document.createElement('div');
    settlementDiv.className = 'cart-settlement-section';
    const agentMin = CATALOG_DATA.meta.agentDiscountMin ?? 0;
    const agentMax = CATALOG_DATA.meta.agentDiscountMax ?? 0;
    const agentPct   = agentMin;
    const pishPct    = CATALOG_DATA.meta.pishVarizPercent || 0;
    const barPct     = CATALOG_DATA.meta.barPercent || 0;
    const barDays    = CATALOG_DATA.meta.barDays || 7;
    const chekiDays  = CATALOG_DATA.meta.chekiDays || 60;
    settlementDiv.innerHTML = `
        <h3 class="settlement-title">💳 تسویه حساب</h3>
        <div class="settlement-agent-row">
            <label>درصد نمایندگی: <strong id="agentValDisplay">${agentMin}</strong>%</label>
            <input type="range" id="agentSlider" class="agent-slider"
                min="${agentMin}" max="${agentMax <= agentMin ? agentMin + 0.1 : agentMax}" step="1" value="${agentMin}"
                ${agentMin === agentMax ? 'disabled' : ''}>
            <div class="agent-range-labels"><span>${agentMin}%</span><span>${agentMax}%</span></div>
        </div>
        <input type="hidden" id="agentVal" value="${agentMin}">
        <div class="settlement-icons-row">
            <button class="settle-type-btn active" id="btnNagdi" data-type="nagdi"><span class="settle-icon">💵</span><span>نقدی</span></button>
            <button class="settle-type-btn" id="btnCheki" data-type="cheki"><span class="settle-icon">📝</span><span>چکی</span></button>
        </div>
        <input type="hidden" id="agentVal" value="${agentPct}">
        <div id="nagdiSection">
            <div class="settle-sub-row">
                <button class="settle-sub-btn active" id="subPishVariz">💵 پیش‌واریز (${pishPct}%)</button>
                <button class="settle-sub-btn" id="subBarDiscount">🚚 بعد از بار (${barPct}%)</button>
            </div>
            <input type="hidden" id="pishVarizVal" value="${pishPct}">
            <input type="hidden" id="barDiscountVal" value="${barPct}">
            <input type="hidden" id="barDaysVal" value="${barDays}">
            <div class="settle-result-box" id="nagdiResult"></div>
            <div class="settle-bank-info" id="nagdiBankInfo"></div>
        </div>
        <div id="chekiSection" style="display:none">
            <div class="settlement-row">
                <label>کد ملی:</label>
                <input type="text" id="chekiNatCode" class="settlement-input" placeholder="کد ملی" dir="ltr" maxlength="10" value="${CATALOG_DATA.meta.defaultNatCode || ''}">
            </div>
            <div class="settlement-row">
                <label>نام صاحب چک:</label>
                <input type="text" id="chekiOwnerName" class="settlement-input" placeholder="نام و نام خانوادگی" value="${CATALOG_DATA.meta.defaultNatName || ''}">
            </div>
            <input type="hidden" id="chekiDaysVal" value="${chekiDays}">
            <div class="settle-result-box" id="chekiResult"></div>
        </div>
    `;
    page.appendChild(settlementDiv);

    const actions = document.createElement('div');
    actions.className = 'cart-actions';
    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-order-btn';
    sendBtn.innerHTML = '◆ ارسال سفارش';
    sendBtn.onclick = () => openSendModal();
    actions.appendChild(sendBtn);

    const invoiceBtn = document.createElement('button');
    invoiceBtn.className = 'send-order-btn invoice-btn';
    invoiceBtn.innerHTML = '◉ پیش‌فاکتور / چاپ';
    invoiceBtn.onclick = () => openPreInvoice();
    actions.appendChild(invoiceBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-cart-btn';
    clearBtn.textContent = '✕ خالی کردن سبد';
    clearBtn.onclick = () => { if (confirm('مطمئن هستید؟')) { cartItems = []; saveCart(); renderCurrentView(false); } };
    actions.appendChild(clearBtn);
    page.appendChild(actions);

    setTimeout(() => {
        updateCartSummary();
        // slider نمایندگی
        const slider = document.getElementById('agentSlider');
        const display = document.getElementById('agentValDisplay');
        const hiddenVal = document.getElementById('agentVal');
        if (slider) {
            slider.addEventListener('input', () => {
                hiddenVal.value = slider.value;
                if (display) display.textContent = slider.value;
                updateCartSummary();
            });
        }
        ['chekiNatCode','chekiOwnerName'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', updateCartSummary);
        });
        document.getElementById('btnNagdi')?.addEventListener('click', () => {
            document.getElementById('btnNagdi').classList.add('active');
            document.getElementById('btnCheki').classList.remove('active');
            document.getElementById('nagdiSection').style.display = '';
            document.getElementById('chekiSection').style.display = 'none';
            updateCartSummary();
        });
        document.getElementById('btnCheki')?.addEventListener('click', () => {
            document.getElementById('btnCheki').classList.add('active');
            document.getElementById('btnNagdi').classList.remove('active');
            document.getElementById('chekiSection').style.display = '';
            document.getElementById('nagdiSection').style.display = 'none';
            updateCartSummary();
        });
        document.getElementById('subPishVariz')?.addEventListener('click', () => {
            document.getElementById('subPishVariz').classList.add('active');
            document.getElementById('subBarDiscount').classList.remove('active');
            updateCartSummary();
        });
        document.getElementById('subBarDiscount')?.addEventListener('click', () => {
            document.getElementById('subBarDiscount').classList.add('active');
            document.getElementById('subPishVariz').classList.remove('active');
            updateCartSummary();
        });
    }, 50);

    return page;
}

/* ---------------------------------------------------------------
   پنل مدیریت - درختی accordion
--------------------------------------------------------------- */
function renderAdminPage() {
    const page = document.createElement('div');
    page.className = 'page page-admin';

    const password = prompt('رمز مدیریتی را وارد کنید:');
    if (password !== '1234') {
        page.innerHTML = '<p style="padding:20px;color:red">❌ رمز نادرست!</p>';
        return page;
    }

    const clockBar = document.createElement('div');
    clockBar.className = 'clock-bar';
    clockBar.innerHTML = `<span id="liveClock">${nowJalali()}</span>`;
    page.appendChild(clockBar);

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = '🔧 پنل مدیریت هوشمند';
    page.appendChild(title);

    /* تب‌ها */
    const tabs = document.createElement('div');
    tabs.className = 'admin-tabs';
    tabs.innerHTML = `
        <button class="admin-tab active" data-tab="products">📦 محصولات</button>
        <button class="admin-tab" data-tab="settings">⚙️ تنظیمات</button>
        <button class="admin-tab" data-tab="theme">🎨 تم رنگی</button>
    `;
    page.appendChild(tabs);

    /* تب محصولات - درختی */
    const tabProducts = document.createElement('div');
    tabProducts.className = 'admin-tab-content';
    tabProducts.id = 'tab-products';

    function buildProductsTree() {
        tabProducts.innerHTML = '';

        CATALOG_DATA.groups.forEach((group, gi) => {
            const groupWrap = document.createElement('div');
            groupWrap.className = 'tree-group';

            /* هدر گروه */
            const groupHeader = document.createElement('div');
            groupHeader.className = 'tree-group-header';
            groupHeader.innerHTML = `
                <span class="tree-toggle">▼</span>
                <span class="tree-group-icon">
                    <img src="${group.icon||''}" onerror="this.style.display='none'" style="width:22px;height:22px;border-radius:4px;vertical-align:middle">
                </span>
                <span class="tree-group-name">${group.title}</span>
                <div class="tree-actions">
                    <button class="tree-btn tree-edit-btn" data-gi="${gi}">✏️ ویرایش</button>
                    <button class="tree-btn tree-img-btn" data-gi="${gi}">🖼️ عکس</button>
                    <input type="file" id="gimg-${gi}" accept="image/*" style="display:none">
                </div>
            `;
            groupWrap.appendChild(groupHeader);

            /* محتوای گروه */
            const groupContent = document.createElement('div');
            groupContent.className = 'tree-group-content';

            if (group.hasSubgroups) {
                (group.subgroups || []).forEach((sub, si) => {
                    const subWrap = document.createElement('div');
                    subWrap.className = 'tree-sub';

                    const subHeader = document.createElement('div');
                    subHeader.className = 'tree-sub-header';
                    subHeader.innerHTML = `
                        <span class="tree-toggle">▼</span>
                        <span class="tree-sub-icon">
                            <img src="${sub.icon||''}" onerror="this.style.display='none'" style="width:18px;height:18px;border-radius:3px;vertical-align:middle">
                        </span>
                        <span class="tree-sub-name">${sub.title}</span>
                        <div class="tree-actions">
                            <button class="tree-btn tree-edit-btn" data-gi="${gi}" data-si="${si}">✏️</button>
                            <button class="tree-btn tree-img-btn" data-gi="${gi}" data-si="${si}">🖼️</button>
                            <input type="file" id="simg-${gi}-${si}" accept="image/*" style="display:none">
                            <button class="tree-btn tree-addprod-btn" data-gi="${gi}" data-si="${si}">➕ کالا</button>
                        </div>
                    `;
                    subWrap.appendChild(subHeader);

                    const subContent = document.createElement('div');
                    subContent.className = 'tree-sub-content';

                    (sub.products || []).forEach((prod, pi) => {
                        subContent.appendChild(buildProductRow(prod, gi, si, pi));
                    });
                    subWrap.appendChild(subContent);
                    groupContent.appendChild(subWrap);
                });

                /* دکمه افزودن زیرگروه */
                const addSubBtn = document.createElement('button');
                addSubBtn.className = 'tree-btn tree-addgroup-btn';
                addSubBtn.dataset.gi = gi;
                addSubBtn.textContent = '➕ زیرگروه جدید';
                addSubBtn.classList.add('add-sub-btn');
                groupContent.appendChild(addSubBtn);
            } else {
                (group.products || []).forEach((prod, pi) => {
                    groupContent.appendChild(buildProductRow(prod, gi, null, pi));
                });
                const addProdBtn = document.createElement('button');
                addProdBtn.className = 'tree-btn tree-addprod-btn';
                addProdBtn.dataset.gi = gi;
                addProdBtn.textContent = '➕ کالای جدید';
                groupContent.appendChild(addProdBtn);
            }

            groupWrap.appendChild(groupContent);
            tabProducts.appendChild(groupWrap);
        });

        /* دکمه افزودن گروه جدید */
        const addGroupBtn = document.createElement('button');
        addGroupBtn.className = 'admin-save-btn add-group-main-btn';
        addGroupBtn.textContent = '➕ گروه جدید';
        addGroupBtn.onclick = () => openAddGroupModal();
        tabProducts.appendChild(addGroupBtn);

        /* بستن/باز کردن accordion */
        tabProducts.querySelectorAll('.tree-group-header').forEach(hdr => {
            hdr.addEventListener('click', e => {
                if (e.target.closest('.tree-actions')) return;
                const content = hdr.nextElementSibling;
                const toggle = hdr.querySelector('.tree-toggle');
                const isOpen = content.style.display !== 'none';
                content.style.display = isOpen ? 'none' : '';
                toggle.textContent = isOpen ? '▶' : '▼';
            });
        });
        tabProducts.querySelectorAll('.tree-sub-header').forEach(hdr => {
            hdr.addEventListener('click', e => {
                if (e.target.closest('.tree-actions')) return;
                const content = hdr.nextElementSibling;
                const toggle = hdr.querySelector('.tree-toggle');
                const isOpen = content.style.display !== 'none';
                content.style.display = isOpen ? 'none' : '';
                toggle.textContent = isOpen ? '▶' : '▼';
            });
        });

        /* ویرایش گروه */
        tabProducts.querySelectorAll('.tree-edit-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const gi = parseInt(btn.dataset.gi);
                const si = btn.dataset.si !== undefined ? parseInt(btn.dataset.si) : null;
                if (si !== null) openEditSubModal(gi, si);
                else openEditGroupModal(gi);
            });
        });

        /* آپلود عکس گروه/زیرگروه */
        tabProducts.querySelectorAll('.tree-img-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const gi = btn.dataset.gi;
                const si = btn.dataset.si;
                const inp = si !== undefined ? document.getElementById(`simg-${gi}-${si}`) : document.getElementById(`gimg-${gi}`);
                if (inp) inp.click();
            });
        });
        tabProducts.querySelectorAll('input[id^="gimg-"]').forEach(inp => {
            inp.onchange = e => {
                const gi = parseInt(inp.id.split('-')[1]);
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    compressAndSaveIcon(ev.target.result, compressed => {
                        CATALOG_DATA.groups[gi].icon = compressed;
                        saveCatalog(); buildProductsTree();
                    });
                };
                reader.readAsDataURL(file);
            };
        });
        tabProducts.querySelectorAll('input[id^="simg-"]').forEach(inp => {
            inp.onchange = e => {
                const parts = inp.id.split('-');
                const gi = parseInt(parts[1]), si = parseInt(parts[2]);
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    compressAndSaveIcon(ev.target.result, compressed => {
                        CATALOG_DATA.groups[gi].subgroups[si].icon = compressed;
                        saveCatalog(); buildProductsTree();
                    });
                };
                reader.readAsDataURL(file);
            };
        });

        /* افزودن زیرگروه */
        tabProducts.querySelectorAll('.add-sub-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const gi = parseInt(btn.dataset.gi);
                const name = prompt('نام زیرگروه جدید:');
                if (!name) return;
                if (!CATALOG_DATA.groups[gi].subgroups) CATALOG_DATA.groups[gi].subgroups = [];
                CATALOG_DATA.groups[gi].subgroups.push({ id: genId(), title: name, icon: '', products: [] });
                saveCatalog(); buildProductsTree();
            });
        });

        /* افزودن محصول */
        tabProducts.querySelectorAll('.tree-addprod-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const gi = parseInt(btn.dataset.gi);
                const si = btn.dataset.si !== undefined ? parseInt(btn.dataset.si) : null;
                const name = prompt('نام محصول جدید:');
                if (!name) return;
                const newProd = {
                    id: genId(), name, price: 0,
                    colors: { mahtabi: false, aftabi: false, nojral: false, black: false, colored: false },
                    colorType: 'rgb', image1: '', image2: '', description: '', cartonQty: 0, discountPercent: 0
                };
                if (si !== null) CATALOG_DATA.groups[gi].subgroups[si].products.push(newProd);
                else CATALOG_DATA.groups[gi].products.push(newProd);
                saveCatalog(); buildProductsTree();
            });
        });
    }

    /* ساخت ردیف محصول در درخت */
    function buildProductRow(prod, gi, si, pi) {
        const colorDefs = [
            { key: 'mahtabi', label: 'مهتابی', color: '#f5f3e7' },
            { key: 'aftabi',  label: 'آفتابی', color: '#ffd98a' },
            { key: 'nojral',  label: 'نچرال',  color: '#e0d8c8' },
            { key: 'black',   label: 'مشکی',   color: '#222'    },
            { key: 'colored', label: 'رنگی',   color: 'linear-gradient(135deg,#f00,#00f,#ff0)' }
        ];
        const row = document.createElement('div');
        row.className = 'tree-product-row';
        row.innerHTML = `
            <div class="tree-prod-name">${prod.name}</div>
            <div class="tree-prod-fields">
                <label>قیمت:</label>
                <input type="text" class="admin-input prod-price" data-id="${prod.id}" value="${prod.price || 0}" style="width:100px" dir="ltr">
                <label>کارتن:</label>
                <input type="text" class="admin-input prod-carton" data-id="${prod.id}" value="${prod.cartonQty || 0}" style="width:60px" dir="ltr">
                <label>درصد:</label>
                <input type="text" class="admin-input prod-discount" data-id="${prod.id}" value="${prod.discountPercent || 0}" style="width:50px" dir="ltr">
                <span>%</span>
            </div>
            <div class="tree-prod-colors">
                <label>رنگ‌ها:</label>
                ${colorDefs.map(c => `
                    <label class="color-check-label" title="${c.label}">
                        <input type="checkbox" class="color-checkbox" data-product-id="${prod.id}" data-color-key="${c.key}" ${prod.colors && prod.colors[c.key] ? 'checked' : ''}>
                        <span class="mini-swatch" style="background:${c.color}"></span>
                        <span>${c.label}</span>
                    </label>
                `).join('')}
            </div>
            <div class="tree-prod-desc">
                <label>توضیحات:</label>
                <input type="text" class="admin-input prod-desc" data-id="${prod.id}" value="${prod.description || ''}" style="width:100%">
            </div>
            <div class="tree-prod-images">
                <button class="img-upload-btn" data-id="${prod.id}" data-field="image1">📷 عکس ۱</button>
                <input type="file" id="p1-${prod.id}" accept="image/*" style="display:none">
                <button class="img-upload-btn" data-id="${prod.id}" data-field="image1-del" style="background:rgba(209,0,0,0.08)">🗑️ عکس ۱</button>
                <button class="img-upload-btn" data-id="${prod.id}" data-field="image2">📦 عکس ۲</button>
                <input type="file" id="p2-${prod.id}" accept="image/*" style="display:none">
                <button class="img-upload-btn" data-id="${prod.id}" data-field="image2-del" style="background:rgba(209,0,0,0.08)">🗑️ عکس ۲</button>
            </div>
            <div class="tree-prod-save">
                <button class="admin-save-btn save-product-btn" data-id="${prod.id}" style="padding:6px 14px;font-size:12px">💾 ذخیره</button>
            </div>
        `;

        /* آپلود عکس محصول */
        row.querySelectorAll('.img-upload-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.field;
                if (field === 'image1') row.querySelector(`#p1-${prod.id}`).click();
                else if (field === 'image2') row.querySelector(`#p2-${prod.id}`).click();
                else if (field === 'image1-del') { if (confirm('حذف عکس ۱؟')) { prod.image1 = ''; saveCatalog(); alert('✅ حذف شد'); } }
                else if (field === 'image2-del') { if (confirm('حذف عکس ۲؟')) { prod.image2 = ''; saveCatalog(); alert('✅ حذف شد'); } }
            });
        });
        const inp1 = row.querySelector(`#p1-${prod.id}`);
        const inp2 = row.querySelector(`#p2-${prod.id}`);
        if (inp1) inp1.onchange = e => handleImageUpload(prod.id, 'image1', e);
        if (inp2) inp2.onchange = e => handleImageUpload(prod.id, 'image2', e);

        /* ذخیره محصول */
        row.querySelector('.save-product-btn').addEventListener('click', () => {
            prod.price          = toNormalNum(row.querySelector('.prod-price').value);
            prod.cartonQty      = toNormalNum(row.querySelector('.prod-carton').value);
            prod.discountPercent = toNormalNum(row.querySelector('.prod-discount').value);
            prod.description    = row.querySelector('.prod-desc').value;
            if (!prod.colors) prod.colors = {};
            row.querySelectorAll('.color-checkbox').forEach(cb => { prod.colors[cb.dataset.colorKey] = cb.checked; });
            saveCatalog();
            alert(`✅ ${prod.name} ذخیره شد!`);
        });

        return row;
    }

    buildProductsTree();

    /* ======= تب تنظیمات ======= */
    const tabSettings = document.createElement('div');
    tabSettings.className = 'admin-tab-content';
    tabSettings.id = 'tab-settings';
    tabSettings.style.display = 'none';

    const bankRows = (CATALOG_DATA.meta.bankAccounts || []).map((acc, i) => `
        <div class="bank-account-row" data-index="${i}">
            <input type="text" class="admin-input bank-name" placeholder="نام بانک" value="${acc.bank||''}" style="width:70px">
            <input type="text" class="admin-input bank-holder" placeholder="نام صاحب حساب" value="${acc.holder||''}">
            <input type="text" class="admin-input bank-account" placeholder="شماره حساب/کارت" value="${acc.account||''}" dir="ltr">
            <input type="text" class="admin-input bank-sheba" placeholder="شبا" value="${acc.sheba||''}" dir="ltr">
            <button onclick="this.closest('.bank-account-row').remove()" style="background:rgba(209,0,0,0.1);color:#d10000;border-radius:6px;padding:4px 8px">🗑️</button>
        </div>`).join('');

    tabSettings.innerHTML = `
        <div class="admin-section">
            <h3 class="admin-section-title">📊 قیمت‌های بازار (ویرایش دستی)</h3>
            <p class="admin-hint">در صورت دسترسی به اینترنت، قیمت‌ها خودکار به‌روز می‌شوند. در غیر این صورت دستی وارد کنید.</p>
            <label>💵 دلار (تومان):</label>
            <input type="text" id="adminMarketDollar" class="admin-input" value="${marketPrices.dollar || ''}" dir="ltr">
            <label>🥇 طلا گرمی (تومان):</label>
            <input type="text" id="adminMarketGold" class="admin-input" value="${marketPrices.gold || ''}" dir="ltr">
            <label>🔶 مس (تومان/کیلو):</label>
            <input type="text" id="adminMarketCopper" class="admin-input" value="${marketPrices.copper || ''}" dir="ltr">
            <label>⚙️ آلومینیوم (تومان/کیلو):</label>
            <input type="text" id="adminMarketAluminum" class="admin-input" value="${marketPrices.aluminum || ''}" dir="ltr">
            <button class="admin-save-btn" id="btnSaveMarket" style="margin-top:6px">💾 ذخیره قیمت‌ها</button>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">📋 مصوبه و جشنواره</h3>
            <label>مصوبه:</label><input type="text" id="adminMosavebeh" class="admin-input" value="${CATALOG_DATA.meta.mosavebeh||''}">
            <label>جشنواره:</label><input type="text" id="adminFestival" class="admin-input" value="${CATALOG_DATA.meta.festival||''}">
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">📞 اطلاعات تماس</h3>
            <label>نام مدیر بازرگانی:</label><input type="text" id="adminContactName" class="admin-input" value="${CATALOG_DATA.meta.contactName||''}">
            <label>عنوان:</label><input type="text" id="adminContactTitle" class="admin-input" value="${CATALOG_DATA.meta.contactTitle||''}">
            <label>شماره تلفن:</label><input type="text" id="adminContactPhone" class="admin-input" value="${CATALOG_DATA.meta.contactPhone||''}" dir="ltr">
            <label>شماره واتساپ:</label><input type="text" id="adminContactWhatsapp" class="admin-input" value="${CATALOG_DATA.meta.contactWhatsapp||''}" dir="ltr">
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">📊 قیمت‌های بازار</h3>
            <p class="admin-hint">دلار و طلا خودکار آنلاین دریافت می‌شن. مس و آلومینیوم را دستی وارد کنید چون منبع رایگان آنلاین ندارند.</p>
            <label style="display:flex;align-items:center;gap:6px">
                <input type="checkbox" id="adminManualMarket" ${CATALOG_DATA.meta.manualMarketPrices ? 'checked' : ''}>
                ویرایش دستی همه قیمت‌ها (غیرفعال کردن دریافت خودکار)
            </label>
            <label>💵 دلار:</label>
            <input type="text" id="adminMDollar" class="admin-input" value="${marketPrices.dollar || ''}" dir="ltr" placeholder="مثال: 65,000">
            <label>🥇 طلا ۱۸ عیار (هر گرم):</label>
            <input type="text" id="adminMGold" class="admin-input" value="${marketPrices.gold || ''}" dir="ltr" placeholder="مثال: 3,500,000">
            <label>🔶 مس (هر کیلو):</label>
            <input type="text" id="adminMCopper" class="admin-input" value="${marketPrices.copper || ''}" dir="ltr" placeholder="مثال: 450,000">
            <label>⚙️ آلومینیوم (هر کیلو):</label>
            <input type="text" id="adminMAluminum" class="admin-input" value="${marketPrices.aluminum || ''}" dir="ltr" placeholder="مثال: 120,000">
            <button class="admin-save-btn" id="btnSaveMarket" style="margin-top:8px">💾 ذخیره قیمت‌های بازار</button>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🔔 تست نوتیفیکیشن‌ها</h3>
            <p class="admin-hint">برای تست، این دکمه‌ها فوراً نوتیف می‌فرستن (در حالت عادی بعد از ۲-۳ روز خودکار اجرا می‌شه).</p>
            <p class="admin-hint" id="notifPermStatus" style="font-weight:bold"></p>
            <button class="admin-save-btn" id="btnRequestNotifPerm">🔓 درخواست اجازه نوتیفیکیشن</button>
            <button class="admin-save-btn" id="btnTestCartNotif" style="margin-top:8px;background:linear-gradient(135deg,#ff7700,#cc5500);color:#fff">🛒 تست یادآوری سبد خرید</button>
            <button class="admin-save-btn" id="btnTestVisitNotif" style="margin-top:8px;background:linear-gradient(135deg,#9333ea,#6b21a8);color:#fff">✨ تست یادآوری بازدید</button>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">💳 تنظیمات تسویه</h3>
            <label>درصد نمایندگی از:</label>
            <div style="display:flex;align-items:center;gap:6px">
                <input type="text" id="adminAgentMin" class="admin-input" value="${CATALOG_DATA.meta.agentDiscountMin ?? 0}" style="flex:1">
                <span>%  تا</span>
                <input type="text" id="adminAgentMax" class="admin-input" value="${CATALOG_DATA.meta.agentDiscountMax ?? 0}" style="flex:1">
                <span>%</span>
            </div>
            <label>درصد پیش‌واریز:</label>
            <div style="display:flex;align-items:center;gap:6px"><input type="text" id="adminPishVariz" class="admin-input" value="${CATALOG_DATA.meta.pishVarizPercent||0}" style="flex:1"><span>%</span></div>
            <label>درصد بعد از بار:</label>
            <div style="display:flex;align-items:center;gap:6px"><input type="text" id="adminBarPercent" class="admin-input" value="${CATALOG_DATA.meta.barPercent||0}" style="flex:1"><span>%</span></div>
            <label>مدت بعد از بار (روز):</label><input type="text" id="adminBarDays" class="admin-input" value="${CATALOG_DATA.meta.barDays||7}">
            <label>مدت چک (روز):</label><input type="text" id="adminChekiDays" class="admin-input" value="${CATALOG_DATA.meta.chekiDays||60}">
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🏦 شماره حساب‌ها</h3>
            <div id="bankAccountsList">${bankRows}</div>
            <button class="admin-save-btn" style="font-size:13px;padding:8px 12px;margin-top:8px" onclick="const d=document.createElement('div');d.className='bank-account-row';d.innerHTML='<input type=\\'text\\' class=\\'admin-input bank-name\\' placeholder=\\'نام بانک\\' style=\\'width:70px\\'><input type=\\'text\\' class=\\'admin-input bank-holder\\' placeholder=\\'نام صاحب حساب\\'><input type=\\'text\\' class=\\'admin-input bank-account\\' placeholder=\\'شماره حساب/کارت\\' dir=\\'ltr\\'><input type=\\'text\\' class=\\'admin-input bank-sheba\\' placeholder=\\'شبا\\' dir=\\'ltr\\'><button onclick=\\'this.closest(\\'.bank-account-row\\').remove()\\' style=\\'background:rgba(209,0,0,0.1);color:#d10000;border-radius:6px;padding:4px 8px\\'>🗑️</button>';document.getElementById('bankAccountsList').appendChild(d);">➕ افزودن حساب</button>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🔄 سیستم بروزرسانی</h3>
            <p class="admin-hint">هر بار که قیمت‌ها یا محصولات را تغییر دادید، ورژن را بالاتر ببرید، ذخیره کنید و فایل را دانلود کنید تا روی GitHub آپلود کنید.</p>
            <label>ورژن فعلی کاتالوگ:</label>
            <input type="text" id="adminCatalogVersion" class="admin-input update-version-input" value="${CATALOG_DATA.meta.catalogVersion || '1.0'}" dir="ltr" placeholder="1.0">
            <button class="admin-save-btn" id="btnPublishUpdate" style="margin-top:6px;background:linear-gradient(135deg,#00a060,#007040);color:#fff">🚀 انتشار بروزرسانی</button>
            <button class="admin-save-btn" id="btnTestSupabase" style="margin-top:8px;background:linear-gradient(135deg,#9333ea,#6b21a8);color:#fff">🔍 تست اتصال آنلاین</button>
            <button class="admin-save-btn" id="btnExportProducts" style="margin-top:8px;background:linear-gradient(135deg,#1a5fb4,#0d3b7a);color:#fff">⬇️ دانلود products.js (برای آپلود GitHub)</button>
            <p class="admin-hint" style="margin-top:4px">پس از دانلود، این فایل را در GitHub جایگزین products.js قدیمی کنید.</p>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🚚 بازه‌های کرایه حمل</h3>
            <p class="admin-hint">برای هر بازه کارتن، درصد کرایه‌ای که شرکت می‌پردازد را وارد کنید.</p>
            ${(CATALOG_DATA.meta.shippingRanges || [
                {from:0,   to:30,  percent:0},
                {from:31,  to:50,  percent:30},
                {from:51,  to:100, percent:50},
                {from:101, to:200, percent:80},
                {from:201, to:9999,percent:100}
            ]).map((r,i) => `
                <div class="shipping-range-row" data-idx="${i}">
                    <span>از</span>
                    <input type="text" class="admin-input sr-from" value="${r.from}" style="width:52px;text-align:center">
                    <span>تا</span>
                    <input type="text" class="admin-input sr-to" value="${r.to === 9999 ? '∞' : r.to}" style="width:52px;text-align:center">
                    <span>کارتن</span>
                    <input type="text" class="admin-input sr-pct" value="${r.percent}" style="width:44px;text-align:center">
                    <span>%</span>
                </div>
            `).join('')}
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🪪 اطلاعات صاحب چک (پیش‌فرض)</h3>
            <p class="admin-hint">این اطلاعات در سبد خرید بخش تسویه چکی به‌صورت پیش‌فرض نمایش داده می‌شود.</p>
            <label>کد ملی صاحب چک:</label>
            <input type="text" id="adminNatCode" class="admin-input" value="${CATALOG_DATA.meta.defaultNatCode||''}" dir="ltr" maxlength="10" placeholder="۱۰ رقم">
            <label>نام و نام خانوادگی:</label>
            <input type="text" id="adminNatName" class="admin-input" value="${CATALOG_DATA.meta.defaultNatName||''}" placeholder="نام کامل">
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">📱 آیدی پیام‌رسان‌ها</h3>
            <label>واتساپ:</label><input type="text" id="adminWhatsapp" class="admin-input" value="${CATALOG_DATA.meta.messengers?.whatsapp||''}" dir="ltr">
            <label>تلگرام:</label><input type="text" id="adminTelegram" class="admin-input" value="${CATALOG_DATA.meta.messengers?.telegram||''}" dir="ltr">
            <label>روبیکا:</label><input type="text" id="adminRubika" class="admin-input" value="${CATALOG_DATA.meta.messengers?.rubika||''}" dir="ltr">
            <label>بله:</label><input type="text" id="adminBale" class="admin-input" value="${CATALOG_DATA.meta.messengers?.bale||''}" dir="ltr">
        </div>
        <button class="admin-save-btn" id="btnSaveSettings" style="margin-top:8px">💾 ذخیره تمام تنظیمات</button>
    `;

    /* ======= تب تم رنگی ======= */
    const tabTheme = document.createElement('div');
    tabTheme.className = 'admin-tab-content';
    tabTheme.id = 'tab-theme';
    tabTheme.style.display = 'none';

    tabTheme.innerHTML = `
        <div class="admin-section">
            <h3 class="admin-section-title">🎨 رنگ‌های سازمانی</h3>
            <label>رنگ اصلی:</label>
            <div class="color-pick-row"><input type="color" id="themeP" value="${CATALOG_DATA.meta.themePrimary||'#d10000'}"><input type="text" class="admin-input" id="themePText" value="${CATALOG_DATA.meta.themePrimary||'#d10000'}" dir="ltr" style="flex:1"></div>
            <label>رنگ تیره:</label>
            <div class="color-pick-row"><input type="color" id="themePD" value="${CATALOG_DATA.meta.themePrimaryDark||'#a30000'}"><input type="text" class="admin-input" id="themePDText" value="${CATALOG_DATA.meta.themePrimaryDark||'#a30000'}" dir="ltr" style="flex:1"></div>
            <label>رنگ روشن:</label>
            <div class="color-pick-row"><input type="color" id="themePL" value="${CATALOG_DATA.meta.themePrimaryLight||'#ff4444'}"><input type="text" class="admin-input" id="themePLText" value="${CATALOG_DATA.meta.themePrimaryLight||'#ff4444'}" dir="ltr" style="flex:1"></div>
            <label>رنگ کادر عکس:</label>
            <div class="color-pick-row"><input type="color" id="themeImgBorder" value="${CATALOG_DATA.meta.themeImgBorder||'#000000'}"><input type="text" class="admin-input" id="themeImgBorderText" value="${CATALOG_DATA.meta.themeImgBorder||'#000000'}" dir="ltr" style="flex:1"></div>
            <div class="theme-preview">
                <div class="theme-preview-bar" id="themePreviewBar">پیش‌نمایش رنگ اصلی</div>
                <button class="theme-preview-btn" id="themePreviewBtn">پیش‌نمایش دکمه</button>
            </div>
        </div>
        <div class="admin-section">
            <h3 class="admin-section-title">🖼️ تصویر پس‌زمینه</h3>
            <p class="admin-hint">می‌توانید رنگ پس‌زمینه یا تصویر تنظیم کنید.</p>
            <label>رنگ پس‌زمینه:</label>
            <div class="color-pick-row">
                <input type="color" id="themeBgColor" value="${CATALOG_DATA.meta.themeBgColor||'#f5f5f5'}">
                <input type="text" class="admin-input" id="themeBgColorText" value="${CATALOG_DATA.meta.themeBgColor||'#f5f5f5'}" dir="ltr" style="flex:1">
            </div>
            <label style="margin-top:8px">تصویر پس‌زمینه:</label>
            <div style="display:flex;gap:8px;margin-top:4px">
                <button class="img-upload-btn" id="btnUploadBg">📁 انتخاب تصویر</button>
                <input type="file" id="bgImageInput" accept="image/*" style="display:none">
                <button class="img-upload-btn" id="btnRemoveBg" style="background:rgba(209,0,0,0.08)">🗑️ حذف تصویر</button>
            </div>
            ${CATALOG_DATA.meta.themeBgImage ? `<img src="${CATALOG_DATA.meta.themeBgImage}" style="width:100%;max-height:80px;object-fit:cover;border-radius:8px;margin-top:8px">` : ''}
        </div>
        <button class="admin-save-btn" id="btnSaveTheme">💾 ذخیره و اعمال تم</button>
        <button class="admin-save-btn" id="btnResetTheme" style="background:rgba(0,0,0,0.08);color:#333;margin-top:8px">🔄 بازگشت به پیش‌فرض</button>
    `;

    page.appendChild(tabProducts);
    page.appendChild(tabSettings);
    page.appendChild(tabTheme);

    /* منطق تب‌ها */
    setTimeout(() => {
        page.querySelectorAll('.admin-tab').forEach(btn => {
            btn.onclick = () => {
                page.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const t = btn.dataset.tab;
                tabProducts.style.display = t === 'products' ? '' : 'none';
                tabSettings.style.display = t === 'settings' ? '' : 'none';
                tabTheme.style.display    = t === 'theme'    ? '' : 'none';
            };
        });

        document.getElementById('btnSaveMarket')?.addEventListener('click', () => {
            marketPrices.dollar   = document.getElementById('adminMarketDollar').value;
            marketPrices.gold     = document.getElementById('adminMarketGold').value;
            marketPrices.copper   = document.getElementById('adminMarketCopper').value;
            marketPrices.aluminum = document.getElementById('adminMarketAluminum').value;
            marketPrices.lastUpdate = nowJalali();
            saveMarketPrices();
            alert('✅ قیمت‌ها ذخیره شد!');
        });

        document.getElementById('btnPublishUpdate')?.addEventListener('click', () => {
            const ver = document.getElementById('adminCatalogVersion').value.trim() || '1.0';
            CATALOG_DATA.meta.catalogVersion = ver;
            localStorage.setItem('catalog_version', ver);
            saveCatalog();
            alert(`✅ ورژن ${ver} منتشر شد!`);
        });

        document.getElementById('btnSaveMarket')?.addEventListener('click', () => {
            marketPrices.dollar   = document.getElementById('adminMDollar').value;
            marketPrices.gold     = document.getElementById('adminMGold').value;
            marketPrices.copper   = document.getElementById('adminMCopper').value;
            marketPrices.aluminum = document.getElementById('adminMAluminum').value;
            marketPrices.lastUpdate = nowJalali();
            CATALOG_DATA.meta.manualMarketPrices = document.getElementById('adminManualMarket').checked;
            saveMarketPrices();
            saveCatalog();
            alert('✅ قیمت‌های بازار ذخیره شد!');
        });

        /* وضعیت اجازه نوتیف */
        const notifStatusEl = document.getElementById('notifPermStatus');
        function updateNotifStatus() {
            if (!('Notification' in window)) { notifStatusEl.textContent = '❌ مرورگر شما نوتیفیکیشن پشتیبانی نمی‌کند'; return; }
            const perm = Notification.permission;
            if (perm === 'granted') notifStatusEl.textContent = '✅ اجازه نوتیفیکیشن داده شده';
            else if (perm === 'denied') notifStatusEl.textContent = '🚫 اجازه نوتیفیکیشن رد شده (در تنظیمات مرورگر فعال کنید)';
            else notifStatusEl.textContent = '⏳ هنوز اجازه خواسته نشده';
        }
        updateNotifStatus();

        document.getElementById('btnRequestNotifPerm')?.addEventListener('click', () => {
            if (!('Notification' in window)) { alert('مرورگر شما نوتیفیکیشن پشتیبانی نمی‌کند.'); return; }
            Notification.requestPermission().then(perm => {
                updateNotifStatus();
                if (perm === 'granted') alert('✅ اجازه داده شد! حالا نوتیفیکیشن‌ها کار می‌کنند.');
                else alert('❌ اجازه داده نشد.');
            });
        });

        document.getElementById('btnTestCartNotif')?.addEventListener('click', () => {
            if (Notification.permission !== 'granted') { alert('⚠️ اول باید اجازه نوتیفیکیشن بدید!'); return; }
            showLocalNotification('🛒 اتروپارس - سبد خرید', 'این یک تست است! سبد خرید شما کالا دارد، همین الان سفارش دهید 🎯', './');
            alert('✅ نوتیف ارسال شد! اگر ندیدید، نوار اعلانات گوشی را چک کنید.');
        });

        document.getElementById('btnTestVisitNotif')?.addEventListener('click', () => {
            if (Notification.permission !== 'granted') { alert('⚠️ اول باید اجازه نوتیفیکیشن بدید!'); return; }
            showLocalNotification('✨ اتروپارس - دلمون برات تنگ شده!', 'این یک تست است! نماینده محترم، یه سری به کاتالوگ بزنید 😊', './');
            alert('✅ نوتیف ارسال شد! اگر ندیدید، نوار اعلانات گوشی را چک کنید.');
        });

        document.getElementById('btnExportProducts')?.addEventListener('click', () => {
            exportProductsJS();
        });

        document.getElementById('btnTestSupabase')?.addEventListener('click', async () => {
            const btn = document.getElementById('btnTestSupabase');
            btn.textContent = '⏳ در حال تست...';
            const writeResult = await supabaseFetch('POST', [{ key: 'test_ping', value: nowJalali() }]);
            const readResult  = await supabaseFetch('GET');
            btn.textContent = '🔍 تست اتصال آنلاین';
            if (writeResult && readResult) {
                const metaRow = readResult.find(r => r.key === 'meta');
                const groupsRow = readResult.find(r => r.key === 'groups');
                let metaInfo = 'یافت نشد';
                if (metaRow) {
                    try {
                        const m = JSON.parse(metaRow.value);
                        metaInfo = `مصوبه: ${m.mosavebeh || '—'}`;
                    } catch(e) {}
                }
                let groupsInfo = 'یافت نشد';
                if (groupsRow) {
                    try {
                        const g = JSON.parse(groupsRow.value);
                        groupsInfo = `${g.length} گروه`;
                    } catch(e) {}
                }
                alert(`✅ اتصال موفق!\n\nنوشتن: موفق\nخواندن: ${readResult.length} ردیف\n\nmeta: ${metaInfo}\ngroups: ${groupsInfo}`);
            } else {
                alert(`❌ اتصال ناموفق!\n\nخطا: ${window.__lastSupabaseError || 'نامشخص'}\n\nاحتمالاً RLS هنوز فعاله یا کلید اشتباهه.`);
            }
        });

        /* ذخیره تنظیمات */
        document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
            CATALOG_DATA.meta.mosavebeh       = document.getElementById('adminMosavebeh').value;
            CATALOG_DATA.meta.festival        = document.getElementById('adminFestival').value;
            CATALOG_DATA.meta.contactName     = document.getElementById('adminContactName').value;
            CATALOG_DATA.meta.contactTitle    = document.getElementById('adminContactTitle').value;
            CATALOG_DATA.meta.contactPhone    = document.getElementById('adminContactPhone').value;
            CATALOG_DATA.meta.contactWhatsapp = document.getElementById('adminContactWhatsapp').value;
            CATALOG_DATA.meta.agentDiscountMin = toNormalNum(document.getElementById('adminAgentMin').value);
            CATALOG_DATA.meta.agentDiscountMax = toNormalNum(document.getElementById('adminAgentMax').value);
            CATALOG_DATA.meta.pishVarizPercent = toNormalNum(document.getElementById('adminPishVariz').value);
            CATALOG_DATA.meta.barPercent      = toNormalNum(document.getElementById('adminBarPercent').value);
            CATALOG_DATA.meta.barDays         = toNormalNum(document.getElementById('adminBarDays').value);
            CATALOG_DATA.meta.chekiDays       = toNormalNum(document.getElementById('adminChekiDays').value);
            CATALOG_DATA.meta.catalogVersion = document.getElementById('adminCatalogVersion').value || CATALOG_DATA.meta.catalogVersion;
            CATALOG_DATA.meta.defaultNatCode  = document.getElementById('adminNatCode').value;
            CATALOG_DATA.meta.defaultNatName  = document.getElementById('adminNatName').value;
            // ذخیره بازه‌های کرایه حمل
            const ranges = [];
            document.querySelectorAll('.shipping-range-row').forEach(row => {
                const from = toNormalNum(row.querySelector('.sr-from').value);
                const toVal = row.querySelector('.sr-to').value.trim();
                const to = (toVal === '∞' || toVal === '') ? 9999 : toNormalNum(toVal);
                const pct = toNormalNum(row.querySelector('.sr-pct').value);
                ranges.push({ from, to, percent: pct });
            });
            if (ranges.length) CATALOG_DATA.meta.shippingRanges = ranges;
            CATALOG_DATA.meta.messengers = {
                whatsapp: document.getElementById('adminWhatsapp').value,
                telegram: document.getElementById('adminTelegram').value,
                rubika:   document.getElementById('adminRubika').value,
                bale:     document.getElementById('adminBale').value
            };
            const accounts = [];
            document.querySelectorAll('.bank-account-row').forEach(row => {
                const b = row.querySelector('.bank-name')?.value    || '';
                const h = row.querySelector('.bank-holder')?.value  || '';
                const a = row.querySelector('.bank-account')?.value || '';
                const s = row.querySelector('.bank-sheba')?.value   || '';
                if (b || a) accounts.push({ bank:b, holder:h, account:a, sheba:s });
            });
            CATALOG_DATA.meta.bankAccounts = accounts;
            saveCatalog();
            alert('✅ تنظیمات ذخیره شد!');
        });

        /* تم رنگی */
        function updateThemePreview() {
            const p  = document.getElementById('themeP')?.value  || '#d10000';
            const pd = document.getElementById('themePD')?.value || '#a30000';
            const bar = document.getElementById('themePreviewBar');
            const btn = document.getElementById('themePreviewBtn');
            if (bar) bar.style.background = `linear-gradient(135deg,${p},${pd})`;
            if (btn) { btn.style.background=`linear-gradient(135deg,${p},${pd})`; btn.style.color='#fff'; btn.style.padding='10px 20px'; btn.style.borderRadius='10px'; }
        }
        [['themeP','themePText','--color-primary'],['themePD','themePDText','--color-primary-dark'],['themePL','themePLText','--color-primary-light']].forEach(([pid,tid,varName]) => {
            const picker = document.getElementById(pid);
            const textEl = document.getElementById(tid);
            if (picker) picker.oninput = () => { if (textEl) textEl.value=picker.value; document.documentElement.style.setProperty(varName,picker.value); updateThemePreview(); };
            if (textEl) textEl.oninput = () => { if (/^#[0-9a-fA-F]{6}$/.test(textEl.value)) { if (picker) picker.value=textEl.value; document.documentElement.style.setProperty(varName,textEl.value); updateThemePreview(); } };
        });
        updateThemePreview();

        document.getElementById('btnSaveTheme')?.addEventListener('click', () => {
            CATALOG_DATA.meta.themePrimary      = document.getElementById('themeP').value;
            CATALOG_DATA.meta.themePrimaryDark  = document.getElementById('themePD').value;
            CATALOG_DATA.meta.themePrimaryLight = document.getElementById('themePL').value;
            CATALOG_DATA.meta.themeImgBorder    = document.getElementById('themeImgBorder').value;
            CATALOG_DATA.meta.themeBgColor      = document.getElementById('themeBgColor').value;
            saveCatalog(); applyTheme(); alert('✅ تم ذخیره شد!');
        });

        // آپلود تصویر پس‌زمینه
        document.getElementById('btnUploadBg')?.addEventListener('click', () => {
            document.getElementById('bgImageInput').click();
        });
        document.getElementById('bgImageInput')?.addEventListener('change', e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                CATALOG_DATA.meta.themeBgImage = ev.target.result;
                saveCatalog(); applyTheme(); alert('✅ تصویر پس‌زمینه ذخیره شد!');
            };
            reader.readAsDataURL(file);
        });
        document.getElementById('btnRemoveBg')?.addEventListener('click', () => {
            CATALOG_DATA.meta.themeBgImage = '';
            saveCatalog(); applyTheme(); alert('✅ تصویر حذف شد');
        });
        document.getElementById('btnResetTheme')?.addEventListener('click', () => {
            CATALOG_DATA.meta.themePrimary='#d10000'; CATALOG_DATA.meta.themePrimaryDark='#a30000'; CATALOG_DATA.meta.themePrimaryLight='#ff4444';
            saveCatalog(); applyTheme(); renderCurrentView(false);
        });
    }, 50);

    return page;
}

/* ---------------------------------------------------------------
   مودال ویرایش گروه
--------------------------------------------------------------- */
function openEditGroupModal(gi) {
    const group = CATALOG_DATA.groups[gi];
    const { box, closeModal } = showModal(`✏️ ویرایش گروه: ${group.title}`, `
        <label>نام گروه:</label>
        <input type="text" id="editGroupName" class="admin-input" value="${group.title}">
        <button class="admin-save-btn" id="btnSaveGroup" style="margin-top:10px">💾 ذخیره</button>
    `);
    box.querySelector('#btnSaveGroup').onclick = () => {
        group.title = box.querySelector('#editGroupName').value || group.title;
        saveCatalog(); closeModal();
        const tabP = document.getElementById('tab-products');
        if (tabP) { const adminPage = tabP.closest('.page-admin'); if (adminPage) renderAdminPage(); }
        renderCurrentView(false);
    };
}

/* ---------------------------------------------------------------
   مودال ویرایش زیرگروه
--------------------------------------------------------------- */
function openEditSubModal(gi, si) {
    const sub = CATALOG_DATA.groups[gi].subgroups[si];
    const { box, closeModal } = showModal(`✏️ ویرایش زیرگروه: ${sub.title}`, `
        <label>نام زیرگروه:</label>
        <input type="text" id="editSubName" class="admin-input" value="${sub.title}">
        <button class="admin-save-btn" id="btnSaveSub" style="margin-top:10px">💾 ذخیره</button>
    `);
    box.querySelector('#btnSaveSub').onclick = () => {
        sub.title = box.querySelector('#editSubName').value || sub.title;
        saveCatalog(); closeModal(); renderCurrentView(false);
    };
}

/* ---------------------------------------------------------------
   مودال افزودن گروه جدید
--------------------------------------------------------------- */
function openAddGroupModal() {
    const { box, closeModal } = showModal('➕ گروه جدید', `
        <label>نام گروه:</label>
        <input type="text" id="newGroupName" class="admin-input" placeholder="مثال: کابل‌ها">
        <label style="margin-top:10px">نوع:</label>
        <div style="display:flex;gap:10px;margin:8px 0">
            <label><input type="radio" name="groupType" value="sub" checked> دارای زیرگروه</label>
            <label><input type="radio" name="groupType" value="prod"> مستقیم محصول</label>
        </div>
        <button class="admin-save-btn" id="btnAddGroup" style="margin-top:10px">➕ ایجاد گروه</button>
    `);
    box.querySelector('#btnAddGroup').onclick = () => {
        const name = box.querySelector('#newGroupName').value;
        if (!name) { alert('نام گروه را وارد کنید'); return; }
        const typeVal = box.querySelector('input[name="groupType"]:checked').value;
        const newGroup = {
            id: genId(), title: name, icon: '',
            hasSubgroups: typeVal === 'sub',
            subgroups: typeVal === 'sub' ? [] : undefined,
            products:  typeVal === 'prod' ? [] : undefined
        };
        CATALOG_DATA.groups.push(newGroup);
        saveCatalog(); closeModal(); renderCurrentView(false);
    };
}

/* ---------------------------------------------------------------
   توابع کمکی به‌روزرسانی محصولات
--------------------------------------------------------------- */
function handleImageUpload(prodId, imageField, event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        // فشرده‌سازی عکس قبل از ذخیره
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 400;
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);

            for (const group of CATALOG_DATA.groups) {
                const allProds = group.hasSubgroups
                    ? (group.subgroups||[]).flatMap(s => s.products||[])
                    : (group.products||[]);
                const prod = allProds.find(p => p.id === prodId);
                if (prod) {
                    prod[imageField] = compressed;
                    saveCatalog();
                    alert('✅ عکس ذخیره شد!');
                    if (currentView.type === 'product' && currentView.productId === prodId) {
                        renderCurrentView(false);
                    }
                    return;
                }
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function compressAndSaveIcon(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        callback(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = dataUrl;
}

/* ---------------------------------------------------------------
   اتصال دکمه‌های ناوبری
--------------------------------------------------------------- */
btnHome.onclick = navigateHome;
btnBack.onclick = navigateBack;
const cartFloat = document.getElementById('cartFloat');
if (cartFloat) cartFloat.onclick = () => navigateTo({ type: 'cart' });
const historyFloat = document.getElementById('historyFloat');
if (historyFloat) historyFloat.onclick = () => navigateTo({ type: 'history' });
updateHistoryBadge();
updateCartBadge();

/* ---------------------------------------------------------------
   شروع برنامه
--------------------------------------------------------------- */
renderCurrentView(true);

/* ---------------------------------------------------------------
   سیستم نوتیفیکیشن محلی
--------------------------------------------------------------- */
function initNotifications() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        // بعد از ۵ ثانیه اجازه نوتیف بخواه
        setTimeout(() => {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    scheduleNotifications();
                }
            });
        }, 5000);
    } else if (Notification.permission === 'granted') {
        scheduleNotifications();
    }
}

function scheduleNotifications() {
    // بررسی نوتیفیکیشن‌های زمان‌بندی شده
    checkCartReminder();
    checkVisitReminder();
    // هر ساعت یه بار چک کن
    setInterval(() => {
        checkCartReminder();
        checkVisitReminder();
    }, 60 * 60 * 1000);
}

function checkCartReminder() {
    if (!cartItems.length) return;
    const lastCartNotif = parseInt(localStorage.getItem('last_cart_notif') || '0');
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastCartNotif < twoDaysMs) return;

    // سبد خرید داره و ۲ روز از آخرین نوتیف گذشته
    localStorage.setItem('last_cart_notif', Date.now().toString());

    const messages = [
        `🛒 سبد خرید شما ${cartItems.length} کالا دارد!\nهنوز سفارشتون رو ارسال نکردید — الان بهترین وقته! 🎯`,
        `⏰ یادآوری: سفارش شما در اتروپارس منتظر ارساله!\n${cartItems.length} کالا در سبد دارید. سریع بفرستید! 🚀`,
        `📦 کالاهای سبد خریدتون از اتروپارس منتظرن!\nقبل از تموم شدن موجودی سفارش بدید. 🔥`
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    showLocalNotification('🛒 اتروپارس - سبد خرید', msg, './');
}

function checkVisitReminder() {
    const lastVisit = parseInt(localStorage.getItem('last_visit') || '0');
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const lastVisitNotif = parseInt(localStorage.getItem('last_visit_notif') || '0');

    // ذخیره زمان آخرین بازدید
    localStorage.setItem('last_visit', Date.now().toString());

    // اگر ۳ روز از آخرین نوتیف گذشته و آخرین بازدید بیشتر از ۳ روز پیش بوده
    if (lastVisit > 0 &&
        Date.now() - lastVisit > threeDaysMs &&
        Date.now() - lastVisitNotif > threeDaysMs) {

        localStorage.setItem('last_visit_notif', Date.now().toString());

        const messages = [
            `🌟 نماینده محترم، مدتیه با اتروپارس در تماس نبودید!\nیه سری به کاتالوگ بزنید، محصولات جدید منتظرتونن. 😊`,
            `👋 دوست عزیز! چند روزیه از اتروپارس خبر نداریم.\nقیمت‌های جدید آماده‌ست — سفارشتون رو ثبت کنید! 💼`,
            `💡 یادآوری دوستانه از اتروپارس:\nکمبود انبارتون رو بررسی کنید و سفارش بدید. ما منتظریم! ⚡`
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showLocalNotification('✨ اتروپارس - دلمون برات تنگ شده!', msg, './');
    }
}

function showLocalNotification(title, body, url) {
    if (Notification.permission !== 'granted') return;
    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, {
                    body,
                    icon: './icon-192.png',
                    badge: './icon-192.png',
                    dir: 'rtl',
                    lang: 'fa',
                    vibrate: [200, 100, 200],
                    tag: 'atropars-reminder',
                    renotify: true,
                    data: { url }
                });
            });
        } else {
            new Notification(title, { body, icon: './icon-192.png', dir: 'rtl', lang: 'fa' });
        }
    } catch(e) { console.log('Notification error:', e); }
}

// شروع سیستم نوتیف
initNotifications();
let lastVersion = localStorage.getItem('catalog_version') || null;

function checkForUpdates() {
    const cur = CATALOG_DATA.meta.catalogVersion || null;
    const stored = localStorage.getItem('catalog_version') || null;
    if (lastVersion !== null && stored !== null && stored !== lastVersion) {
        lastVersion = stored;
        showUpdateNotification();
    } else if (lastVersion === null) {
        lastVersion = stored;
    }
}

// وقتی مشتری آنلاین شد چک کن
window.addEventListener('online', () => {
    setTimeout(checkForUpdates, 1000);
});

function showUpdateNotification() {
    const old = document.querySelector('.update-notification');
    if (old) old.remove();
    const notif = document.createElement('div');
    notif.className = 'update-notification';
    notif.innerHTML = `
        <div class="update-content">
            <span class="update-text">✨ نسخه جدید کاتالوگ موجود است</span>
            <div class="update-buttons">
                <button class="update-btn-yes">🔄 بروزرسانی</button>
                <button class="update-btn-no">بعداً</button>
            </div>
        </div>`;
    document.body.appendChild(notif);
    notif.querySelector('.update-btn-yes').onclick = () => location.reload();
    notif.querySelector('.update-btn-no').onclick  = () => notif.remove();
}

setInterval(checkForUpdates, 30000);
