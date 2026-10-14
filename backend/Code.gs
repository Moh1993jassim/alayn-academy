/**
 * أكاديمية الاستحصال — خادم سجل القسم (Google Apps Script)
 * قسم الترويج والاستحصال — لجنة تطوير المستحصلين
 *
 * التشغيل لأول مرة:
 *   1) أنشئ Google Sheet جديداً (يفضّل بحساب القسم) ثم: الإضافات ← Apps Script.
 *   2) الصق هذا الملف كاملاً بدل المحتوى الموجود، واحفظ.
 *   3) اختر الدالة setup من القائمة واضغط «تشغيل» ووافق على الصلاحيات.
 *   4) الصق قائمة المندوبين في ورقة «المندوبون» (الاسم، الهاتف، الفرع، المكتب، المدرب).
 *   5) نشر ← نشر جديد ← نوع: تطبيق ويب ← التنفيذ باسم: أنا ← من يملك الوصول: أي شخص ← نشر.
 *   6) انسخ رابط تطبيق الويب وضعه في config.js في الموقع (API_URL).
 */

const SH = { roster: 'المندوبون', trainers: 'المدربون', trainees: 'المتدربون', attempts: 'سجل_الاختبارات', log: 'سجل_النشاط', dash: 'لوحة_القسم' };
const TRACKS = [['fin', 'المالي'], ['kaf', 'الكفالة'], ['mkh', 'المخازن'], ['sun', 'الصناديق']];
const TOKEN_DAYS = 45;
const MAX_FAILS = 8;          // محاولات دخول خاطئة قبل القفل المؤقت
const LOCK_MINUTES = 15;
const NAVY = '#13294B';

/* ---------------- setup ---------------- */
function setup() {
  const ss = SpreadsheetApp.getActive();
  const mk = (name, headers, widths) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.setRightToLeft(true);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground(NAVY).setFontColor('#FFFFFF').setWrap(true);
      sh.setFrozenRows(1);
      (widths || []).forEach((w, i) => sh.setColumnWidth(i + 1, w));
    }
    return sh;
  };
  mk(SH.roster, ['الاسم الكامل', 'رقم الهاتف', 'الفرع', 'المكتب', 'المدرب', 'فعّال (نعم / لا)'], [260, 130, 140, 160, 180, 110]);
  mk(SH.trainers, ['اسم المدرب', 'الفرع'], [220, 160]);
  const tHead = ['المفتاح', 'الاسم', 'الهاتف', 'الفرع', 'المكتب', 'المدرب', 'أول دخول', 'آخر نشاط', 'مرات الدخول'];
  TRACKS.forEach(([, t]) => tHead.push(t + ': الوحدات', t + ': أفضل درجة', t + ': الحالة', t + ': الشهادة'));
  tHead.push('المسارات المجتازة', 'بيانات التقدم');
  const tr = mk(SH.trainees, tHead, [110, 240, 120, 120, 140, 160, 140, 140, 90]);
  tr.hideColumns(1); tr.hideColumns(tHead.length);
  mk(SH.attempts, ['الوقت', 'الاسم', 'الفرع', 'المدرب', 'المسار', 'الدرجة %', 'صحيح', 'من', 'النتيجة', 'رقم المحاولة', 'رقم الشهادة'], [140, 240, 120, 160, 100, 80, 70, 60, 90, 90, 150]);
  mk(SH.log, ['الوقت', 'الاسم', 'الفرع', 'الحدث', 'التفاصيل'], [140, 240, 120, 120, 360]);
  buildDashboard_(ss);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SECRET')) props.setProperty('SECRET', Utilities.getUuid() + Utilities.getUuid());
  ss.setActiveSheet(ss.getSheetByName(SH.dash));
}

function buildDashboard_(ss) {
  const sh = ss.getSheetByName(SH.dash) || ss.insertSheet(SH.dash, 0);
  sh.clear(); sh.setRightToLeft(true);
  const T = "'" + SH.trainees + "'", R = "'" + SH.roster + "'";
  const statusCol = ['L', 'P', 'T', 'X'], bestCol = ['K', 'O', 'S', 'W'];
  sh.getRange('A1').setValue('لوحة متابعة أكاديمية الاستحصال — تتحدث تلقائياً').setFontSize(16).setFontWeight('bold').setFontColor(NAVY);
  // KPIs
  const kpi = [['في سجل المندوبين', `=COUNTA(${R}!A2:A)`], ['دخلوا المنصة', `=COUNTA(${T}!B2:B)`], ['اجتازوا المالي', `=COUNTIF(${T}!L2:L,"ناجح")`], ['اجتازوا الكفالة', `=COUNTIF(${T}!P2:P,"ناجح")`], ['اجتازوا المخازن', `=COUNTIF(${T}!T2:T,"ناجح")`], ['اجتازوا الصناديق', `=COUNTIF(${T}!X2:X,"ناجح")`], ['اجتازوا الأربعة', `=COUNTIF(${T}!Z2:Z,4)`]];
  kpi.forEach(([l, f], i) => { sh.getRange(3, i + 1).setValue(l); sh.getRange(4, i + 1).setFormula(f); });
  sh.getRange(3, 1, 1, kpi.length).setBackground('#E2F4F5').setFontWeight('bold');
  sh.getRange(4, 1, 1, kpi.length).setFontSize(18).setFontWeight('bold').setHorizontalAlignment('center');
  // by branch
  const bh = ['الفرع', 'في السجل', 'دخلوا', 'المالي', 'الكفالة', 'المخازن', 'الصناديق', 'الأربعة', 'متوسط المالي %'];
  sh.getRange(6, 1).setValue('حسب الفرع').setFontWeight('bold').setFontColor(NAVY);
  sh.getRange(7, 1, 1, bh.length).setValues([bh]).setBackground(NAVY).setFontColor('#FFFFFF').setFontWeight('bold');
  sh.getRange('A8').setFormula(`=IFERROR(SORT(UNIQUE(FILTER(${R}!C2:C,${R}!C2:C<>""))),"")`);
  sh.getRange('B8').setFormula(`=ARRAYFORMULA(IF(A8:A="",,COUNTIF(${R}!C2:C,A8:A)))`);
  sh.getRange('C8').setFormula(`=ARRAYFORMULA(IF(A8:A="",,COUNTIF(${T}!D2:D,A8:A)))`);
  statusCol.forEach((c, i) => sh.getRange(8, 4 + i).setFormula(`=ARRAYFORMULA(IF(A8:A="",,COUNTIFS(${T}!D2:D,A8:A,${T}!${c}2:${c},"ناجح")))`));
  sh.getRange('H8').setFormula(`=ARRAYFORMULA(IF(A8:A="",,COUNTIFS(${T}!D2:D,A8:A,${T}!Z2:Z,4)))`);
  sh.getRange('I8').setFormula(`=ARRAYFORMULA(IF(A8:A="",,IFERROR(ROUND(AVERAGEIFS(${T}!K2:K,${T}!D2:D,A8:A,${T}!K2:K,">0"),0),"")))`);
  // by trainer
  const th = ['المدرب', 'متدربون', 'المالي', 'الكفالة', 'المخازن', 'الصناديق', 'الأربعة'];
  sh.getRange(6, 11).setValue('حسب المدرب').setFontWeight('bold').setFontColor(NAVY);
  sh.getRange(7, 11, 1, th.length).setValues([th]).setBackground(NAVY).setFontColor('#FFFFFF').setFontWeight('bold');
  sh.getRange('K8').setFormula(`=IFERROR(SORT(UNIQUE(FILTER(${T}!F2:F,${T}!F2:F<>""))),"")`);
  sh.getRange('L8').setFormula(`=ARRAYFORMULA(IF(K8:K="",,COUNTIF(${T}!F2:F,K8:K)))`);
  statusCol.forEach((c, i) => sh.getRange(8, 13 + i).setFormula(`=ARRAYFORMULA(IF(K8:K="",,COUNTIFS(${T}!F2:F,K8:K,${T}!${c}2:${c},"ناجح")))`));
  sh.getRange('Q8').setFormula(`=ARRAYFORMULA(IF(K8:K="",,COUNTIFS(${T}!F2:F,K8:K,${T}!Z2:Z,4)))`);
  sh.setColumnWidths(1, 17, 110); sh.setColumnWidth(1, 160); sh.setColumnWidth(11, 180);
  sh.setFrozenRows(4);
}

/* ---------------- web endpoints ---------------- */
function doGet() { return out_({ ok: true, service: 'alayn-academy' }); }
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad_request' }); }
  try {
    if (req.action === 'login') return out_(login_(req));
    if (req.action === 'events') return out_(events_(req));
    return out_({ ok: false, error: 'unknown_action' });
  } catch (err) { return out_({ ok: false, error: 'server', msg: String(err) }); }
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- login ---------------- */
function login_(req) {
  const pk = phoneKey_(req.phone), nm = String(req.name || '');
  if (!/^7\d{9}$/.test(pk) || tokens_(nm).length < 3) return { ok: false, error: 'not_found' };
  const cache = CacheService.getScriptCache(), fk = 'fail:' + pk;
  const fails = +(cache.get(fk) || 0);
  if (fails >= MAX_FAILS) return { ok: false, error: 'locked' };
  const ss = SpreadsheetApp.getActive(), rs = ss.getSheetByName(SH.roster);
  const rows = rs.getLastRow() > 1 ? rs.getRange(2, 1, rs.getLastRow() - 1, 6).getValues().map(r => r.map(x => String(x))) : [];
  const inT = tokens_(nm);
  const hit = rows.find(r => phoneKey_(r[1]) === pk && String(r[5]).trim() !== 'لا' && nameMatch_(inT, tokens_(r[0])));
  if (!hit) { cache.put(fk, String(fails + 1), LOCK_MINUTES * 60); return { ok: false, error: 'not_found' }; }
  cache.remove(fk);
  const user = { name: String(hit[0]).trim(), branch: String(hit[2]).trim(), office: String(hit[3]).trim(), trainer: String(hit[4]).trim() };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let progress = null;
  try {
    const ts = ss.getSheetByName(SH.trainees);
    const row = findRow_(ts, 'p' + pk), now = new Date();
    if (row) {
      const v = ts.getRange(row, 1, 1, ts.getLastColumn()).getValues()[0];
      if (!user.trainer && v[5]) user.trainer = String(v[5]);
      ts.getRange(row, 2, 1, 8).setValues([[user.name, "'0" + pk, user.branch, user.office, user.trainer, v[6] || now, now, (+v[8] || 0) + 1]]);
      try { progress = JSON.parse(v[v.length - 1] || 'null'); } catch (e) { progress = null; }
    } else {
      const width = ts.getLastColumn(), r = new Array(width).fill('');
      r[0] = 'p' + pk; r[1] = user.name; r[2] = "'0" + pk; r[3] = user.branch; r[4] = user.office; r[5] = user.trainer; r[6] = now; r[7] = now; r[8] = 1;
      ts.appendRow(r);
    }
    log_(ss, [[new Date(), user.name, user.branch, 'دخول', '']]);
  } finally { lock.releaseLock(); }
  const res = { ok: true, token: sign_({ pk: pk, exp: Date.now() + TOKEN_DAYS * 864e5 }), user: user, progress: progress };
  if (!user.trainer) res.trainers = trainers_(ss, user.branch);
  return res;
}
function trainers_(ss, branch) {
  const sh = ss.getSheetByName(SH.trainers);
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues().filter(r => r[0]);
  const same = v.filter(r => !r[1] || !branch || norm_(r[1]) === norm_(branch)).map(r => r[0].trim());
  return (same.length ? same : v.map(r => r[0].trim())).filter((x, i, a) => a.indexOf(x) === i);
}

/* ---------------- events ---------------- */
function events_(req) {
  const p = verify_(req.token);
  if (!p) return { ok: false, error: 'auth' };
  const ss = SpreadsheetApp.getActive(), ts = ss.getSheetByName(SH.trainees);
  const lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    const row = findRow_(ts, 'p' + p.pk);
    if (!row) return { ok: false, error: 'auth' };
    const width = ts.getLastColumn(), v = ts.getRange(row, 1, 1, width).getValues()[0];
    const who = { name: v[1], branch: v[3], trainer: v[5] };
    const logs = [], attempts = [];
    (req.events || []).slice(0, 50).forEach(ev => {
      const at = ev.at ? new Date(ev.at) : new Date();
      if (ev.ev === 'trainer' && ev.trainer) { who.trainer = String(ev.trainer); v[5] = who.trainer; logs.push([at, who.name, who.branch, 'اختيار المدرب', who.trainer]); }
      else if (ev.ev === 'module') logs.push([at, who.name, who.branch, 'إتمام وحدة', (ev.title || ev.mod) + ' — ' + trackName_(ev.tr)]);
      else if (ev.ev === 'video') logs.push([at, who.name, who.branch, 'مشاهدة فيديو', ev.mod + ' — ' + (ev.pct || 0) + '%' + (ev.via ? ' (' + ev.via + ')' : '')]);
      else if (ev.ev === 'role') logs.push([at, who.name, who.branch, 'تحديد العمل', ev.role || '']);
      else if (ev.ev === 'exam') {
        attempts.push([at, who.name, who.branch, who.trainer, trackName_(ev.tr), +ev.score || 0, +ev.right || 0, +ev.total || 0, ev.pass ? 'ناجح' : 'لم يجتز', +ev.attempt || 1, ev.cert || '']);
        logs.push([at, who.name, who.branch, 'اختبار', trackName_(ev.tr) + ': ' + ev.score + '%' + (ev.pass ? ' — ناجح' : '')]);
      }
    });
    // summary from the trainee's snapshot
    const snap = req.snap || {}, tr = snap.tracks || {};
    let nPass = 0;
    TRACKS.forEach(([k], i) => {
      const t = tr[k]; const c = 9 + i * 4;
      if (!t) return;
      v[c] = t.done + ' / ' + t.total;
      v[c + 1] = t.best == null ? '' : t.best;
      v[c + 2] = t.pass ? 'ناجح' : (t.best == null ? (t.done ? 'جارٍ' : 'لم يبدأ') : 'لم يجتز');
      v[c + 3] = t.cert || '';
      if (t.pass) nPass++;
    });
    v[25] = nPass; v[7] = new Date();
    v[width - 1] = JSON.stringify({ tracks: tr, done: snap.done || [], vid: snap.vid || [], role: snap.role || '' }).slice(0, 49000);
    ts.getRange(row, 1, 1, width).setValues([v]);
    if (attempts.length) { const a = ss.getSheetByName(SH.attempts); a.getRange(a.getLastRow() + 1, 1, attempts.length, attempts[0].length).setValues(attempts); }
    log_(ss, logs);
  } finally { lock.releaseLock(); }
  return { ok: true };
}

/* ---------------- helpers ---------------- */
function log_(ss, rows) { if (!rows.length) return; const l = ss.getSheetByName(SH.log); l.getRange(l.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows); }
function findRow_(sh, key) {
  if (sh.getLastRow() < 2) return 0;
  const f = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(String(key)).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function trackName_(k) { const t = TRACKS.find(x => x[0] === k); return t ? t[1] : String(k || ''); }
function phoneKey_(p) {
  const d = String(p || '').replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '');
  return d.replace(/^(00964|964|0)/, '');
}
function norm_(s) {
  return String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/عبد\s+/g, 'عبد').replace(/\s+/g, ' ').trim().toLowerCase();
}
function tokens_(s) { return norm_(s).split(' ').filter(Boolean); }
function nameMatch_(a, b) {
  // الاسم المكتوب يطابق بداية الاسم المسجل (الثلاثي من الرباعي) أو العكس
  if (a.length < 3 || b.length < 2) return false;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return false;
  return n >= Math.min(3, b.length);
}
function secret_() { return PropertiesService.getScriptProperties().getProperty('SECRET'); }
function sign_(payload) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, secret_()));
  return body + '.' + sig;
}
function verify_(token) {
  if (!token || String(token).indexOf('.') < 0) return null;
  const [body, sig] = String(token).split('.');
  const good = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, secret_()));
  if (good !== sig) return null;
  let p; try { p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(body)).getDataAsString()); } catch (e) { return null; }
  if (!p || !p.pk || !p.exp || p.exp < Date.now()) return null;
  return p;
}
