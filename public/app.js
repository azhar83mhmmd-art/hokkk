const $ = s => document.querySelector(s), esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DL = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/></svg>';
const MB = b => (b / 1048576).toFixed(1) + ' MB';
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const WHICH = [
 ['ARM64-v8a — direkomendasikan', 'Pilihan untuk sebagian besar HP Android modern. Hampir semua HP yang dirilis sejak sekitar 2017 (umumnya Android 8 ke atas) memakai prosesor 64-bit. Android 7.0 sudah bisa 64-bit, tetapi HP Android 7 yang murah atau lama masih sering 32-bit.'],
 ['ARMv7 (armeabi-v7a)', 'Untuk HP 32-bit: umumnya HP lama atau murah, banyak yang berjalan di Android 7 sampai 9, dan sebagian HP Android Go. Perhatian: prosesor 64-bit bisa menjalankan Android 32-bit, dalam kasus itu pilih ARMv7.'],
 ['Universal', 'Pilihan praktis jika tidak tahu arsitektur HP-mu. Isinya mencakup arm64-v8a, armeabi-v7a dan x86_64, jadi ukurannya hampir dua kali lipat.'],
 ['x86_64', 'Untuk perangkat Android berbasis Intel/AMD 64-bit: emulator PC seperti BlueStacks, LDPlayer, Android Studio, laptop Chromebook tertentu. Bukan untuk HP ARM biasa.']
];
const STEPS = [
 ['Download APK', 'Pilih varian APK yang sesuai dengan perangkat Android kamu, kemudian tekan tombol Download.'],
 ['Open Downloaded File', 'Buka File Manager, masuk ke folder Download, lalu pilih file HokTifyy APK.'],
 ['Allow Unknown Apps', 'Jika muncul peringatan keamanan, buka pengaturan dan izinkan instalasi aplikasi dari sumber yang digunakan untuk membuka APK tersebut.', 'Biasanya aplikasinya Chrome atau File Manager. Aktifkan "Allow from this source", lalu kembali dan buka APK lagi.'],
 ['Install Application', 'Tekan tombol Install dan tunggu sampai proses instalasi selesai.'],
 ['Open HokTifyy', 'Setelah berhasil diinstal, buka aplikasi HokTifyy dan mulai nikmati musik favoritmu.']
];
const TROUBLE = [
 ['App Not Installed', 'Periksa kompatibilitas arsitektur, versi Android (minimum 7.0), ruang penyimpanan, dan kemungkinan konflik tanda tangan dengan versi lama. Jika ada versi lama dengan tanda tangan berbeda, hapus dulu lalu pasang ulang.'],
 ['Parse Error', 'Pastikan file APK sudah selesai diunduh dan tidak rusak. Unduh ulang dengan koneksi stabil. Parse error juga muncul pada Android di bawah 7.0.'],
 ['Installation Blocked', 'Periksa izin instalasi aplikasi dari sumber yang digunakan untuk membuka APK (Chrome atau File Manager).'],
 ['App Keeps Crashing', 'Pastikan perangkat memenuhi persyaratan minimum aplikasi dan kamu memasang varian arsitektur yang tepat.'],
 ['Not Enough Storage', 'Kosongkan penyimpanan perangkat sebelum instalasi. Siapkan ruang minimal dua kali ukuran APK.']
];
const FAQ = [
 ['Apa itu HokTifyy?', 'HokTifyy adalah aplikasi musik untuk Android untuk menemukan dan memutar musik favoritmu.'],
 ['Bagaimana cara download HokTifyy?', 'Buka bagian Download for Android, pilih varian yang cocok, lalu tekan tombol Download. Lanjutkan dengan panduan instalasi.'],
 ['Apa perbedaan ARM64 dan ARMv7?', 'ARM64 untuk prosesor 64-bit (HP modern), ARMv7 untuk 32-bit (HP lama atau Android 32-bit). Keduanya bukan soal kualitas, hanya kecocokan dengan perangkat.'],
 ['APK mana yang cocok untuk HP saya?', 'Kebanyakan HP modern cocok dengan ARM64. Gunakan tombol How to Check My Android Architecture untuk memastikan, atau pilih Universal jika ragu.'],
 ['Apakah HokTifyy gratis?', 'Mengunduh APK dari halaman ini tidak dipungut biaya.'],
 ['Mengapa APK tidak bisa diinstal?', 'Penyebab umum: arsitektur tidak cocok, Android di bawah 7.0, file rusak, penyimpanan penuh, atau izin sumber tidak aktif. Lihat bagian Troubleshooting.'],
 ['Bagaimana cara memperbarui HokTifyy?', 'Unduh versi terbaru dari halaman ini dan pasang di atas versi lama. Data biasanya tetap ada selama tanda tangan aplikasi sama.'],
 ['Apakah download HokTifyy aman?', 'Unduh hanya dari halaman resmi ini. Android memberi peringatan untuk semua APK di luar Play Store; itu normal, bukan tanda file berbahaya.']
];
const acc = (el, rows) => el.innerHTML = rows.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200); }

const ICONS = {
  stream: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  player: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  discover: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  library: '<path d="M5 4v16M10 4v16M15 5l4 15"/>',
  note: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>'
};
const iconFor = t => /stream/i.test(t) ? 'stream' : /player/i.test(t) ? 'player' : /discover|trending/i.test(t) ? 'discover' : /search/i.test(t) ? 'search' : /library|queue/i.test(t) ? 'library' : 'note';
const svg = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

function cards(cfg) {
  const vt = 'v' + cfg.version;
  $('#ver-h').textContent = vt; $('#verOpt').textContent = vt + ' — Rilis Terbaru'; $('#verTag').textContent = vt; $('#verDate').textContent = fmtDate(cfg.updated);
  $('#andro').textContent = 'Mendukung ' + cfg.minAndroid + ' ke atas. Pilih APK sesuai arsitektur perangkatmu. Ragu? Ambil Universal.';
  $('#cards').innerHTML = cfg.apks.map(a => {
    const ok = !!a.url;
    return `<div class="v${a.recommended ? ' rec' : ''}"><div><h4>${esc(a.name.replace('HokTifyy Android ', ''))}${a.recommended ? '<span class="rb">Disarankan</span>' : ''}</h4>
      <small>${esc(a.arch)}</small><small>${MB(a.sizeBytes)} · APK · ${esc(cfg.minAndroid)}</small></div>
      <a class="btn white" data-key="${a.key}" href="${ok ? '/api/download?v=' + encodeURIComponent(a.key) : '#unduh'}" ${ok ? '' : 'aria-disabled="true" tabindex="-1"'}>${DL}${ok ? esc(a.button) : 'Coming Soon'}</a></div>`;
  }).join('');
  $('#cards').addEventListener('click', e => {
    const b = e.target.closest('a.btn[data-key]'); if (!b) return;
    if (b.dataset.busy) return e.preventDefault();
    b.dataset.busy = 1; toast('Unduhan dimulai. Cek folder Download atau notifikasi browser.');
    setTimeout(() => delete b.dataset.busy, 8000);
  });
  $('#which').innerHTML = WHICH.map(([t, d]) => `<div class="card nl"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('');
  $('#feat').innerHTML = cfg.features.filter(x => x.on).map(x => `<div class="card"><div class="ico">${svg(ICONS[iconFor(x.t)] || ICONS.note)}</div><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('');
}

let shown = 0;
function tick(to) {
  const out = $('#count'), from = shown; shown = to;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches || from === to) { out.textContent = to.toLocaleString('en-US'); return; }
  const t0 = performance.now();
  (function f(t) { const p = Math.min(1, (t - t0) / 900); out.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(f); })(t0);
}

async function stats() {
  const live = $('#live'), txt = $('#live-t');
  try {
    const c = await (await fetch('/api/config')).json();
    if (!c.supabaseUrl || !c.anonKey) throw 0;
    await new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'; s.onload = ok; s.onerror = no; document.head.append(s); });
    const sb = supabase.createClient(c.supabaseUrl, c.anonKey);
    const pull = async () => { const { data, error } = await sb.from('download_stats').select('total_downloads').eq('id', 1).single(); if (error) throw error; tick(+data.total_downloads); };
    await pull();
    sb.channel('dl-stats').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'download_stats' }, p => tick(+p.new.total_downloads))
      .subscribe(s => { live.dataset.on = s === 'SUBSCRIBED'; txt.textContent = s === 'SUBSCRIBED' ? 'Statistik Langsung' : 'Menyambungkan ulang'; });
    setInterval(() => pull().catch(() => {}), 30000);       // fallback if the realtime socket drops
  } catch (e) { txt.textContent = 'Statistik tidak tersedia'; }
}

async function guess() {
  const ua = navigator.userAgent, out = $('#guess'), v = +(ua.match(/Android (\d+)/) || [])[1];
  if (!v) { out.textContent = 'Kamu tidak membuka halaman ini dari perangkat Android, jadi arsitektur HP tidak bisa dideteksi. Ikuti langkah di bawah.'; return; }
  let a = '', b = '';
  try { const h = await navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness']); a = h.architecture; b = h.bitness; } catch (e) {}
  let m = `Android ${v} terdeteksi. ` + (v < 7 ? 'Versi ini di bawah minimum (Android 7.0), HokTifyy tidak bisa dipasang. ' : '');
  if (/x86/.test(a) && b === '64') m += 'Perkiraan: x86_64.';
  else if (/arm/.test(a) && b === '64') m += 'Perkiraan: ARM64-v8a.';
  else if (/arm/.test(a) && b === '32') m += 'Perkiraan: ARMv7.';
  else m += 'Browser tidak memberi info arsitektur. Ikuti langkah di bawah, atau pilih Universal.';
  out.textContent = m;
}

document.addEventListener('DOMContentLoaded', async () => {
  acc($('#trouble'), TROUBLE); acc($('#faqs'), FAQ);
  $('#steps').innerHTML = STEPS.map(([t, d, more], i) => `<li><span class="n">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p>${more ? `<details><summary>Penjelasan lebih detail</summary><p>${esc(more)}</p></details>` : ''}</div></li>`).join('');
  const nav = document.querySelector('.nav nav'), bg = document.querySelector('.burger');
  bg.onclick = () => bg.setAttribute('aria-expanded', nav.classList.toggle('open'));
  nav.onclick = () => { nav.classList.remove('open'); bg.setAttribute('aria-expanded', false); };
  $('#open-arch').onclick = () => { guess(); $('#arch').showModal(); };
  try { cards(await (await fetch('/apk-config.json')).json()); } catch (e) { $('#cards').textContent = 'Gagal memuat daftar APK. Muat ulang halaman.'; }
  initFx(); stats();
});


// ===== Motion =====
function initFx() {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  $('.count').insertAdjacentHTML('afterbegin', '<span class="eqi" aria-hidden="true"><i></i><i></i><i></i><i></i></span>');
  if (calm) return;

  // scroll progress bar
  const bar = document.createElement('div'); bar.id = 'bar'; document.body.append(bar);
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener('scroll', prog, { passive: true }); prog();

  // reveal on scroll, staggered inside each parent
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const seen = new Map();
  document.querySelectorAll('.hero>*, section>*, .stack>*, .steps>li, .acc>details, #cards>.v, footer>*').forEach(el => {
    if (el.classList.contains('rv') || el.tagName === 'DIALOG') return;
    const n = seen.get(el.parentNode) || 0; seen.set(el.parentNode, n + 1);
    el.style.setProperty('--d', Math.min(n, 6) * .09 + 's'); el.classList.add('rv'); io.observe(el);
  });

  // floating particles, depth-parallax with scroll
  const cv = document.createElement('canvas'); cv.id = 'fx'; document.body.prepend(cv);
  const ctx = cv.getContext('2d'); let W, H, P = [], raf, dpr = Math.min(devicePixelRatio || 1, 2);
  const make = () => { const amb = Math.random() < .22, r = 2 + Math.random() * 8;
    return { x: Math.random() * W, y: Math.random() * H, r, vx: (Math.random() - .5) * .18, vy: .06 + Math.random() * .22, ph: Math.random() * 6.28,
      c: amb ? '245,165,36' : '255,255,255', a: amb ? .16 + Math.random() * .14 : .05 + Math.random() * .1 }; };
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); P = Array.from({ length: Math.min(52, Math.round(W / 15)) }, make); };
  const frame = t => {
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      p.x += p.vx + Math.sin(t / 1800 + p.ph) * .12; p.y += p.vy;
      if (p.y - p.r > H) { p.y = -p.r; p.x = Math.random() * W; } if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      const y = ((p.y - scrollY * .12 * (p.r / 9)) % (H + 20) + (H + 20)) % (H + 20) - 10;
      ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, 6.283); ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  size(); addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(frame); });
  raf = requestAnimationFrame(frame);
}
