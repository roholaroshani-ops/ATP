/* ===================================================================
   فایل داده محصولات کاتالوگ هوشمند اتروپارس
   -------------------------------------------------------------
   این فایل قلب کاتالوگ است. هر تغییر قیمت، رنگ، عکس یا توضیحات
   فقط در همین فایل (یا از طریق پنل مدیریت که همین داده را در
   localStorage ذخیره و بازخوانی می‌کند) انجام می‌شود.

   ساختار کلی:
   CATALOG_DATA = {
       meta: { مصوبه, جشنواره },
       groups: [
           {
               id, title, icon (مسیر عکس/آیکون گروه),
               hasSubgroups: true/false,
               subgroups: [ ... ]   // اگر hasSubgroups = true
               products: [ ... ]    // اگر hasSubgroups = false (مستقیم محصول)
           }
       ]
   }

   هر "محصول" دارای ساختار زیر است:
   {
       id: شناسه یکتا (برای سبد خرید و پنل مدیریت),
       name: نام کامل محصول (همان که در سبد و فاکتور می‌آید),
       price: قیمت به ریال (عدد، قابل ویرایش از پنل مدیریت),
       colors: { mahtabi: bool, aftabi: bool, nojral: bool } یا
               { black: bool, colored: bool } یا
               null (برای کالاهایی که رنگ ندارند),
       colorType: "rgb" | "bw" | "none"
       image1: مسیر عکس محصول,
       image2: مسیر عکس بسته‌بندی,
       description: توضیحات محصول (نمایش در صفحه آخر)
   }
=================================================================== */

const CATALOG_DATA = {

    /* ---------------- اطلاعات بالای صفحه اول ---------------- */
  meta: {
        mosavebeh: "450229/159",      // عدد مصوبه
        festival: "",                   // متن جشنواره
        discountNagdi: 0,               // درصد تخفیف نقدی پیش‌واریز

        // اطلاعات تماس
        contactName: "مهندس روشنی",
        contactTitle: "مدیر بازرگانی",
        contactPhone: "09153063083",
        contactWhatsapp: "989153063083",

        // تسویه نقدی
        pishVarizPercent: 5,            // درصد تخفیف پیش‌واریز
        barPercent: 3,                  // درصد تخفیف بعد از بار
        barDays: 7,                     // مدت بعد از بار (روز)

        // تسویه چکی
        chekiDays: 60,                  // مدت چک (روز از امروز)

        // شماره حساب‌ها
        bankAccounts: [
            { bank: "ملت", account: "6104337812345678", sheba: "IR120570028080013447776300" },
            { bank: "صادرات", account: "0219876543210", sheba: "" }
        ],

        // آیدی پیام‌رسان‌ها برای ارسال سفارش
        messengers: {
            whatsapp: "989153063083",
            telegram: "",
            rubika: "",
            bale: ""
        },

        // تم رنگی
        themePrimary: "#d10000",
        themePrimaryDark: "#a30000",
        themePrimaryLight: "#ff4444"
    },

    /* ---------------- گروه‌های اصلی کاتالوگ ---------------- */
    groups: [

        /* ===================== ۱. لامپ‌ها ===================== */
        {
            id: "lamps",
            title: "لامپ‌ها",
            icon: "assets/icons/group-lamps.png",
            hasSubgroups: true,
            subgroups: [
                {
                    id: "lamps-habab",
                    title: "لامپ‌های حبابی",
                    icon: "assets/icons/sub-lamp-habab.png",
                    products: [
                        {
                            id: "lamp-ashki-7",
                            name: "لامپ اشکی ۷ وات",
                            price: 1260000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ashki-7-1.jpg",
                            image2: "assets/products/lamp-ashki-7-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-habab-10",
                            name: "لامپ حبابی ۱۰ وات",
                            price: 1340000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-habab-10-1.jpg",
                            image2: "assets/products/lamp-habab-10-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-habab-12",
                            name: "لامپ حبابی ۱۲ وات",
                            price: 1590000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-habab-12-1.jpg",
                            image2: "assets/products/lamp-habab-12-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-habab-15",
                            name: "لامپ حبابی ۱۵ وات",
                            price: 2200000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-habab-15-1.jpg",
                            image2: "assets/products/lamp-habab-15-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-habab-20",
                            name: "لامپ حبابی ۲۰ وات",
                            price: 3210000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-habab-20-1.jpg",
                            image2: "assets/products/lamp-habab-20-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-habab-25",
                            name: "لامپ حبابی ۲۵ وات",
                            price: 3900000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-habab-25-1.jpg",
                            image2: "assets/products/lamp-habab-25-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "lamps-ostovaneh",
                    title: "لامپ‌های استوانه",
                    icon: "assets/icons/sub-lamp-ostovaneh.png",
                    products: [
                        {
                            id: "lamp-ostovaneh-20",
                            name: "لامپ استوانه ۲۰ وات",
                            price: 3290000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-20-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-20-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-ostovaneh-30",
                            name: "لامپ استوانه ۳۰ وات",
                            price: 5390000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-30-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-30-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-ostovaneh-40",
                            name: "لامپ استوانه ۴۰ وات",
                            price: 7710000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-40-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-40-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-ostovaneh-50",
                            name: "لامپ استوانه ۵۰ وات",
                            price: 9100000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-50-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-50-2.jpg",
                            description: ""
                        },
                        {
                            id: "lamp-ostovaneh-60",
                            name: "لامپ استوانه ۶۰ وات",
                            price: 0,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-60-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-60-2.jpg",
                            description: "به زودی"
                        },
                        {
                            id: "lamp-ostovaneh-70",
                            name: "لامپ استوانه ۷۰ وات",
                            price: 14000000,
                            colors: { mahtabi: true, aftabi: true, nojral: false },
                            colorType: "rgb",
                            image1: "assets/products/lamp-ostovaneh-70-1.jpg",
                            image2: "assets/products/lamp-ostovaneh-70-2.jpg",
                            description: ""
                        }
                    ]
                }
            ]
        },

        /* ===================== ۲. پنل‌ها ===================== */
        {
            id: "panels",
            title: "پنل‌ها",
            icon: "assets/icons/group-panels.png",
            hasSubgroups: true,
            subgroups: [
                {
                    id: "panel-negin-plus",
                    title: "پنل نگین پلاس",
                    icon: "assets/icons/sub-panel-negin-plus.png",
                    products: [
                        {
                            id: "panel-negin-plus-7",
                            name: "پنل نگین پلاس ۷ وات",
                            price: 1290000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-negin-plus-7-1.jpg",
                            image2: "assets/products/panel-negin-plus-7-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-negin-plus-10",
                            name: "پنل نگین پلاس ۱۰ وات",
                            price: 1690000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-negin-plus-10-1.jpg",
                            image2: "assets/products/panel-negin-plus-10-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "panel-negin",
                    title: "پنل نگین",
                    icon: "assets/icons/sub-panel-negin.png",
                    products: [
                        {
                            id: "panel-negin-7",
                            name: "پنل نگین ۷ وات",
                            price: 1200000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-negin-7-1.jpg",
                            image2: "assets/products/panel-negin-7-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-negin-10",
                            name: "پنل نگین ۱۰ وات",
                            price: 0,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-negin-10-1.jpg",
                            image2: "assets/products/panel-negin-10-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "panel-almas",
                    title: "پنل الماس (دور شیشه)",
                    icon: "assets/icons/sub-panel-almas.png",
                    products: [
                        {
                            id: "panel-almas-7",
                            name: "پنل الماس ۷ وات",
                            price: 1710000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-almas-7-1.jpg",
                            image2: "assets/products/panel-almas-7-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-almas-10",
                            name: "پنل الماس ۱۰ وات",
                            price: 0,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-almas-10-1.jpg",
                            image2: "assets/products/panel-almas-10-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "panel-elegant",
                    title: "پنل الگانت",
                    icon: "assets/icons/sub-panel-elegant.png",
                    products: [
                        {
                            id: "panel-elegant-8",
                            name: "پنل الگانت ۸ وات",
                            price: 2100000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-elegant-8-1.jpg",
                            image2: "assets/products/panel-elegant-8-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-elegant-12",
                            name: "پنل الگانت ۱۲ وات",
                            price: 3950000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-elegant-12-1.jpg",
                            image2: "assets/products/panel-elegant-12-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-elegant-20",
                            name: "پنل الگانت ۲۰ وات",
                            price: 0,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-elegant-20-1.jpg",
                            image2: "assets/products/panel-elegant-20-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "panel-3state",
                    title: "پنل سه حالته",
                    icon: "assets/icons/sub-panel-3state.png",
                    products: [
                        {
                            id: "panel-3state-10",
                            name: "پنل سه حالته ۱۰ وات",
                            price: 3990000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-3state-10-1.jpg",
                            image2: "assets/products/panel-3state-10-2.jpg",
                            description: ""
                        },
                        {
                            id: "panel-3state-12",
                            name: "پنل سه حالته ۱۲ وات",
                            price: 6990000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-3state-12-1.jpg",
                            image2: "assets/products/panel-3state-12-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "panel-60x60",
                    title: "پنل ۶۰×۶۰",
                    icon: "assets/icons/sub-panel-60x60.png",
                    products: [
                        {
                            id: "panel-60x60-70-1drive",
                            name: "پنل ۶۰×۶۰ یک درایو ۷۰ وات",
                            price: 0,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-60x60-70-1.jpg",
                            image2: "assets/products/panel-60x60-70-2.jpg",
                            description: "به زودی"
                        },
                        {
                            id: "panel-60x60-120-2drive",
                            name: "پنل ۶۰×۶۰ دو درایو ۱۲۰ وات",
                            price: 37000000,
                            colors: { mahtabi: false, aftabi: false, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/panel-60x60-120-1.jpg",
                            image2: "assets/products/panel-60x60-120-2.jpg",
                            description: ""
                        }
                    ]
                }
            ]
        },

        /* ===================== ۳. فول‌لایت ===================== */
        {
            id: "fulllight",
            title: "فول لایت (فنر متحرک)",
            icon: "assets/icons/group-fulllight.png",
            hasSubgroups: true,
            subgroups: [
                {
                    id: "fulllight-tookar",
                    title: "فول لایت توکار",
                    icon: "assets/icons/sub-fulllight-tookar.png",
                    products: [
                        {
                            id: "fulllight-tookar-10",
                            name: "فول لایت توکار ۱۰ وات",
                            price: 3400000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-tookar-10-1.jpg",
                            image2: "assets/products/fulllight-tookar-10-2.jpg",
                            description: ""
                        },
                        {
                            id: "fulllight-tookar-18",
                            name: "فول لایت توکار ۱۸ وات",
                            price: 4600000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-tookar-18-1.jpg",
                            image2: "assets/products/fulllight-tookar-18-2.jpg",
                            description: ""
                        },
                        {
                            id: "fulllight-tookar-24",
                            name: "فول لایت توکار ۲۴ وات",
                            price: 7100000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-tookar-24-1.jpg",
                            image2: "assets/products/fulllight-tookar-24-2.jpg",
                            description: ""
                        },
                        {
                            id: "fulllight-tookar-36",
                            name: "فول لایت توکار ۳۶ وات",
                            price: 9900000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-tookar-36-1.jpg",
                            image2: "assets/products/fulllight-tookar-36-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "fulllight-rookar",
                    title: "فول لایت روکار",
                    icon: "assets/icons/sub-fulllight-rookar.png",
                    products: [
                        {
                            id: "fulllight-rookar-24",
                            name: "فول لایت روکار ۲۴ وات",
                            price: 8300000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-rookar-24-1.jpg",
                            image2: "assets/products/fulllight-rookar-24-2.jpg",
                            description: ""
                        },
                        {
                            id: "fulllight-rookar-36",
                            name: "فول لایت روکار ۳۶ وات",
                            price: 12390000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/fulllight-rookar-36-1.jpg",
                            image2: "assets/products/fulllight-rookar-36-2.jpg",
                            description: ""
                        }
                    ]
                }
            ]
        },

        /* ===================== ۴. واترپروف IP65 ===================== */
        {
            id: "waterproof",
            title: "واترپروف (حمامی)",
            icon: "assets/icons/group-waterproof.png",
            hasSubgroups: false,
            products: [
                {
                    id: "waterproof-15",
                    name: "حمامی ۱۵ وات",
                    price: 4800000,
                    colors: { mahtabi: true, aftabi: true, nojral: true },
                    colorType: "rgb",
                    image1: "assets/products/waterproof-15-1.jpg",
                    image2: "assets/products/waterproof-15-2.jpg",
                    description: ""
                },
                {
                    id: "waterproof-18",
                    name: "حمامی ۱۸ وات",
                    price: 5300000,
                    colors: { mahtabi: true, aftabi: true, nojral: true },
                    colorType: "rgb",
                    image1: "assets/products/waterproof-18-1.jpg",
                    image2: "assets/products/waterproof-18-2.jpg",
                    description: ""
                }
            ]
        },

        /* ===================== ۵. براکت‌ها ===================== */
        {
            id: "brackets",
            title: "براکت‌ها",
            icon: "assets/icons/group-brackets.png",
            hasSubgroups: true,
            subgroups: [
                {
                    id: "bracket-fusion",
                    title: "براکت هایوژن",
                    icon: "assets/icons/sub-bracket-fusion.png",
                    products: [
                        {
                            id: "bracket-fusion-30",
                            name: "براکت هایوژن ۳۰ وات",
                            price: 7180000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-fusion-30-1.jpg",
                            image2: "assets/products/bracket-fusion-30-2.jpg",
                            description: ""
                        },
                        {
                            id: "bracket-fusion-50",
                            name: "براکت هایوژن ۵۰ وات",
                            price: 10500000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-fusion-50-1.jpg",
                            image2: "assets/products/bracket-fusion-50-2.jpg",
                            description: ""
                        },
                        {
                            id: "bracket-fusion-85",
                            name: "براکت هایوژن ۸۵ وات",
                            price: 17900000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-fusion-85-1.jpg",
                            image2: "assets/products/bracket-fusion-85-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "bracket-ecoplus",
                    title: "براکت اکو پلاس",
                    icon: "assets/icons/sub-bracket-ecoplus.png",
                    products: [
                        {
                            id: "bracket-ecoplus-30",
                            name: "براکت اکو پلاس ۳۰ وات",
                            price: 6680000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-ecoplus-30-1.jpg",
                            image2: "assets/products/bracket-ecoplus-30-2.jpg",
                            description: ""
                        },
                        {
                            id: "bracket-ecoplus-45",
                            name: "براکت اکو پلاس ۴۵ وات",
                            price: 9600000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-ecoplus-45-1.jpg",
                            image2: "assets/products/bracket-ecoplus-45-2.jpg",
                            description: ""
                        },
                        {
                            id: "bracket-ecoplus-85",
                            name: "براکت اکو پلاس ۸۵ وات",
                            price: 17400000,
                            colors: { mahtabi: true, aftabi: true, nojral: true },
                            colorType: "rgb",
                            image1: "assets/products/bracket-ecoplus-85-1.jpg",
                            image2: "assets/products/bracket-ecoplus-85-2.jpg",
                            description: ""
                        }
                    ]
                }
            ]
        },

        /* ===================== ۶. چسب برق ===================== */
        {
            id: "tape",
            title: "چسب برق",
            icon: "assets/icons/group-tape.png",
            hasSubgroups: false,
            products: [
                {
                    id: "tape-gl",
                    name: "چسب برق GL",
                    price: 650000,
                    colors: { black: true, colored: true },
                    colorType: "bw",
                    image1: "assets/products/tape-gl-1.jpg",
                    image2: "assets/products/tape-gl-2.jpg",
                    description: ""
                },
                {
                    id: "tape-atp",
                    name: "چسب برق ATP",
                    price: 560000,
                    colors: { black: true, colored: true },
                    colorType: "bw",
                    image1: "assets/products/tape-atp-1.jpg",
                    image2: "assets/products/tape-atp-2.jpg",
                    description: ""
                }
            ]
        },

        /* ===================== ۷. پروژکتورها ===================== */
        {
            id: "projectors",
            title: "پروژکتورها",
            icon: "assets/icons/group-projectors.png",
            hasSubgroups: false,
            products: [
                {
                    id: "projector-30",
                    name: "پروژکتور ۳۰ وات",
                    price: 9900000,
                    colors: { mahtabi: true, aftabi: false, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/projector-30-1.jpg",
                    image2: "assets/products/projector-30-2.jpg",
                    description: ""
                },
                {
                    id: "projector-50",
                    name: "پروژکتور ۵۰ وات",
                    price: 14900000,
                    colors: { mahtabi: true, aftabi: false, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/projector-50-1.jpg",
                    image2: "assets/products/projector-50-2.jpg",
                    description: ""
                },
                {
                    id: "projector-100",
                    name: "پروژکتور ۱۰۰ وات",
                    price: 24000000,
                    colors: { mahtabi: true, aftabi: false, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/projector-100-1.jpg",
                    image2: "assets/products/projector-100-2.jpg",
                    description: ""
                },
                {
                    id: "projector-150",
                    name: "پروژکتور ۱۵۰ وات",
                    price: 36900000,
                    colors: { mahtabi: true, aftabi: false, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/projector-150-1.jpg",
                    image2: "assets/products/projector-150-2.jpg",
                    description: ""
                },
                {
                    id: "projector-200",
                    name: "پروژکتور ۲۰۰ وات",
                    price: 53000000,
                    colors: { mahtabi: true, aftabi: false, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/projector-200-1.jpg",
                    image2: "assets/products/projector-200-2.jpg",
                    description: ""
                }
            ]
        },

        /* ===================== ۸. ریسه‌ها ===================== */
        {
            id: "strips",
            title: "ریسه‌ها",
            icon: "assets/icons/group-strips.png",
            hasSubgroups: false,
            products: [
                {
                    id: "strip-2835-1m",
                    name: "ریسه ۲۸۳۵ برش یک متر",
                    price: 159000000,
                    colors: { mahtabi: true, aftabi: true, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/strip-2835-1m-1.jpg",
                    image2: "assets/products/strip-2835-1m-2.jpg",
                    description: ""
                },
                {
                    id: "strip-2835-20cm",
                    name: "ریسه ۲۸۳۵ برش ۲۰ سانت",
                    price: 0,
                    colors: { mahtabi: true, aftabi: true, nojral: false },
                    colorType: "rgb",
                    image1: "assets/products/strip-2835-20cm-1.jpg",
                    image2: "assets/products/strip-2835-20cm-2.jpg",
                    description: "به زودی"
                }
            ]
        },

        /* ===================== ۹. کابل کواکسیال ===================== */
        {
            id: "coax",
            title: "کابل کواکسیال",
            icon: "assets/icons/group-coax.png",
            hasSubgroups: false,
            products: [
                {
                    id: "coax-fullhd",
                    name: "کابل کواکسیال فول اچ‌دی",
                    price: 46000000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/coax-fullhd-1.jpg",
                    image2: "assets/products/coax-fullhd-2.jpg",
                    description: ""
                },
                {
                    id: "coax-economy",
                    name: "کابل کواکسیال اکونومی",
                    price: 37000000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/coax-economy-1.jpg",
                    image2: "assets/products/coax-economy-2.jpg",
                    description: ""
                }
            ]
        },

        /* ===================== ۱۰. کابل زوجی ===================== */
        {
            id: "pairwire",
            title: "کابل زوجی",
            icon: "assets/icons/group-pairwire.png",
            hasSubgroups: false,
            products: [
                {
                    id: "pairwire-2",
                    name: "کابل ۲ زوج",
                    price: 180000000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/pairwire-2-1.jpg",
                    image2: "assets/products/pairwire-2-2.jpg",
                    description: ""
                },
                {
                    id: "pairwire-4",
                    name: "کابل ۴ زوج",
                    price: 183000000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/pairwire-4-1.jpg",
                    image2: "assets/products/pairwire-4-2.jpg",
                    description: ""
                },
                {
                    id: "pairwire-6",
                    name: "کابل ۶ زوج",
                    price: 212500000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/pairwire-6-1.jpg",
                    image2: "assets/products/pairwire-6-2.jpg",
                    description: ""
                },
                {
                    id: "pairwire-10",
                    name: "کابل ۱۰ زوج",
                    price: 1470000,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/pairwire-10-1.jpg",
                    image2: "assets/products/pairwire-10-2.jpg",
                    description: "قیمت به ازای هر متر"
                }
            ]
        },

        /* ===================== ۱۱. جعبه فیوز ===================== */
        {
            id: "fusebox",
            title: "جعبه فیوز",
            icon: "assets/icons/group-fusebox.png",
            hasSubgroups: true,
            subgroups: [
                {
                    id: "fusebox-neopars",
                    title: "جعبه فیوز نئوپارس",
                    icon: "assets/icons/sub-fusebox-neopars.png",
                    products: [
                        {
                            id: "fusebox-neopars-4",
                            name: "جعبه فیوز نئوپارس ۴ تایی",
                            price: 3780000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-neopars-4-1.jpg",
                            image2: "assets/products/fusebox-neopars-4-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-neopars-6",
                            name: "جعبه فیوز نئوپارس ۶ تایی",
                            price: 3800000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-neopars-6-1.jpg",
                            image2: "assets/products/fusebox-neopars-6-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-neopars-8",
                            name: "جعبه فیوز نئوپارس ۸ تایی",
                            price: 5100000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-neopars-8-1.jpg",
                            image2: "assets/products/fusebox-neopars-8-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-neopars-12",
                            name: "جعبه فیوز نئوپارس ۱۲ تایی",
                            price: 7100000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-neopars-12-1.jpg",
                            image2: "assets/products/fusebox-neopars-12-2.jpg",
                            description: ""
                        }
                    ]
                },
                {
                    id: "fusebox-voltapars",
                    title: "جعبه فیوز ولتاپارس",
                    icon: "assets/icons/sub-fusebox-voltapars.png",
                    products: [
                        {
                            id: "fusebox-voltapars-6",
                            name: "جعبه فیوز ولتاپارس ۶ تایی",
                            price: 3970000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-voltapars-6-1.jpg",
                            image2: "assets/products/fusebox-voltapars-6-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-voltapars-8",
                            name: "جعبه فیوز ولتاپارس ۸ تایی",
                            price: 5170000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-voltapars-8-1.jpg",
                            image2: "assets/products/fusebox-voltapars-8-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-voltapars-12",
                            name: "جعبه فیوز ولتاپارس ۱۲ تایی",
                            price: 7130000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-voltapars-12-1.jpg",
                            image2: "assets/products/fusebox-voltapars-12-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-voltapars-16-18",
                            name: "جعبه فیوز ولتاپارس ۱۶ الی ۱۸ تایی",
                            price: 9260000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-voltapars-16-18-1.jpg",
                            image2: "assets/products/fusebox-voltapars-16-18-2.jpg",
                            description: ""
                        },
                        {
                            id: "fusebox-voltapars-24",
                            name: "جعبه فیوز ولتاپارس ۲۴ تایی",
                            price: 15600000,
                            colors: null,
                            colorType: "none",
                            image1: "assets/products/fusebox-voltapars-24-1.jpg",
                            image2: "assets/products/fusebox-voltapars-24-2.jpg",
                            description: ""
                        }
                    ]
                }
            ]
        },

        /* ===================== ۱۲. چراغ دیواری ===================== */
        {
            id: "wall-light",
            title: "چراغ دیواری",
            icon: "assets/icons/group-walllight.png",
            hasSubgroups: false,
            products: [
                {
                    id: "wall-light-rect",
                    name: "چراغ دیواری مستطیل",
                    price: 0,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/wall-light-rect-1.jpg",
                    image2: "assets/products/wall-light-rect-2.jpg",
                    description: ""
                },
                {
                    id: "wall-light-circle",
                    name: "چراغ دیواری دایره",
                    price: 0,
                    colors: null,
                    colorType: "none",
                    image1: "assets/products/wall-light-circle-1.jpg",
                    image2: "assets/products/wall-light-circle-2.jpg",
                    description: ""
                }
            ]
        }

    ] // پایان groups
};