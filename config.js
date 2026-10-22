/* =====================================================================
   إعدادات أكاديمية الاستحصال — هذا الملف وحده يُعدَّل عند التشغيل
   ===================================================================== */
window.ACADEMY_CONFIG = {

  /* رابط Google Apps Script بعد النشر (Deploy ← Web app).
     اتركه فارغاً لتعمل المنصة بوضع العرض دون إرسال النتائج. */
  API_URL: '',

  /* نسبة المشاهدة المطلوبة من الفيديو قبل فتح إتمام الوحدة */
  WATCH_REQUIRED: 0.90,

  /* درجة النجاح في الاختبارات */
  PASS: 80,

  /* الرقم المتحرك في صفحة الدخول (من «عملنا بالأرقام» في موقع المؤسسة) — حدّثه عند تغيّره */
  IMPACT: { n: 111173, t: 'يتيماً تحتضنهم مؤسسة العين', src: 'الرقم من موقع المؤسسة aynyateem.com' },

  /* فيديو الشرح لكل وحدة — سطر واحد لكل وحدة.
     ⚠ الروابط الحالية تجريبية: عند تجهيز فيديو الوحدة استبدل الرابط بين علامتي '' فقط.

     ملف فيديو مرفوع مع الموقع داخل assets/videos (الأضمن: يعمل على كل الأجهزة ولا يسمح بتجاوز ما لم يُشاهَد):
        { mp4: 'assets/videos/اسم-الملف.mp4', poster: 'assets/videos/صورة-الغلاف.jpg' }
     YouTube (يُحتسب الوقت المشاهَد فعلاً، والتقديم السريع لا يُحتسب):
        { yt: 'https://youtu.be/XXXXXXXXXXX' }
     مع سؤال تحقق يظهر أثناء المشاهدة (at = الثانية التي يظهر عندها، a = رقم الجواب الصحيح يبدأ من 0):
        { yt: '...', checks: [ { at: 95, q: 'السؤال', o: ['خيار 1','خيار 2','خيار 3'], a: 1 } ] }
     Instagram (احتياطي — لا يمكن قياس المشاهدة، يُفتح المقطع ويُحتسب بعداد مدته بالثواني):
        { ig: 'https://www.instagram.com/reel/XXXX/', sec: 90 }
     لإلغاء الفيديو من وحدة: احذف سطرها.
     يُنصح برفع فيديوهات YouTube بخيار «غير مدرج» (Unlisted) مع السماح بالتضمين (Allow embedding). */
  VIDEOS: {

    /* ── المسار المالي ── */
    m1:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg', checks: [ { at: 41, q: 'ما الذي يسبق قطع الوصل مباشرة؟', o: ['عدّ المبلغ والتأكد من نوع العملة','تنزيل تطبيق العين للمحسن','تسليم الدفتر إلى الفرع'], a: 0 } ] },  // استقبال المحسن واستلام التبرع (فيديو مرفوع مع الموقع)
    m2:  { ig: 'https://www.instagram.com/reel/DNsmfnr2FtR/', sec: 60 },   // جهاز المحصل الإلكتروني  (نموذج Instagram)
    m3:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // تبويب الأموال
    m4:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // الحقوق الشرعية
    m5:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // الوصل الورقي
    m6:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // إبطال الوصولات وتعديلها
    m7:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // الدفاتر والمطبوعات
    m8:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // أمانة الأموال والتصفية
    m9:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // الأخطاء الشائعة
    m10: { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // سند القبض العام في Oracle (ملحق)

    /* ── مسار الكفالة ── */
    k1:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },  // الترويج للكفالة واستقبال الكفيل
    k2:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // ملء طلب التكفل
    k3:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // متابعة الكفيل والمتغيرات
    k4:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // بلوغ اليتيم والزيارات
    k5:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // الحقوق الشرعية وملاحظات مهمة
    k6:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // تطبيق العين ورسائل الكفلاء
    k7:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // وصولات الكفلاء في جهاز المحصل
    k8:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // طلبات الخدمة للكفالة
    k9:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // أبرز المشاكل والمعوقات

    /* ── مسار المخازن ── */
    s1:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },  // أنواع المواد العينية ودليلها
    s2:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // آلية الاستلام والمحذورات

    /* ── مسار صناديق الصدقات ── */
    b1:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },  // صناديق الصدقات ومراحل الصندوق
    b2:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // أنواع العهدة والرموز
    b3:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // استلام العهدة من الفرع
    b4:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // توزيع الصناديق على المتصدقين
    b5:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // سحب الصناديق الممتلئة
    b6:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' },   // تصفية الصناديق الممتلئة
    b7:  { mp4: 'assets/videos/m1-trial.mp4', poster: 'assets/videos/m1-trial.jpg' }    // الأخطاء وطلبات الخدمة والفقدان
  }
};
