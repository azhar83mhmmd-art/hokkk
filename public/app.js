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

function cards(cfg) {
  $('#ver').textContent = cfg.version; $('#minand').textContent = cfg.minAndroid;
  $('#cards').innerHTML = cfg.apks.map(a => {
    const ok = !!a.url;
    return `<article class="card glass${a.recommended ? ' rec' : ''}">${a.recommended ? '<span class="badge">Recommended</span>' : ''}
      <h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p>
      <dl><dt>Arsitektur</dt><dd>${esc(a.arch)}</dd><dt>Versi</dt><dd>${esc(cfg.version)}</dd><dt>Ukuran</dt><dd>${MB(a.sizeBytes)}</dd>
      <dt>Minimum Android</dt><dd>${esc(cfg.minAndroid)}</dd><dt>Diperbarui</dt><dd>${fmtDate(cfg.updated)}</dd><dt>Format</dt><dd>APK</dd></dl>
      <a class="btn primary" data-key="${a.key}" href="${ok ? '/api/download?v=' + encodeURIComponent(a.key) : '#downloads'}" ${ok ? '' : 'aria-disabled="true" tabindex="-1"'}>${DL}${ok ? esc(a.button) : 'Coming Soon'}</a></article>`;
  }).join('');
  const rec = cfg.apks.find(a => a.recommended && a.url);
  const main = $('#dl-main'); main.innerHTML = DL + 'Download for Android';
  main.href = rec ? '/api/download?v=' + rec.key : '#downloads';
  $('#cards').addEventListener('click', e => {           // block repeat clicks, show feedback
    const b = e.target.closest('a.btn[data-key]'); if (!b) return;
    if (b.dataset.busy) return e.preventDefault();
    b.dataset.busy = 1; toast('Download dimulai. Cek folder Download atau notifikasi browser.');
    setTimeout(() => delete b.dataset.busy, 8000);
  });
  $('#which').innerHTML = WHICH.map(([t, d]) => `<div class="card glass"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('');
  const f = cfg.features.filter(x => x.on);
  $('#feat').innerHTML = f.map(x => `<div class="card glass"><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('');
}

function eq() {
  const el = document.querySelector('.eq'), n = Math.min(48, Math.floor(innerWidth / 24));
  el.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--h:${20 + Math.abs(Math.sin(i * 0.7)) * 70}%;--d:${(i % 9) * -0.27}s"></i>`).join('');
  return el;
}

let shown = 0;
function tick(to) {
  const out = $('#count'), from = shown; shown = to;
  document.querySelector('.eq').classList.add('pulse'); setTimeout(() => document.querySelector('.eq').classList.remove('pulse'), 1500);
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
      .subscribe(s => { live.dataset.on = s === 'SUBSCRIBED'; txt.textContent = s === 'SUBSCRIBED' ? 'Live Statistics' : 'Reconnecting'; });
    setInterval(() => pull().catch(() => {}), 30000);       // fallback if the realtime socket drops
  } catch (e) { txt.textContent = 'Statistics unavailable'; }
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
  eq(); acc($('#trouble'), TROUBLE); acc($('#faqs'), FAQ);
  $('#steps').innerHTML = STEPS.map(([t, d, more], i) => `<li class="glass"><span class="n">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p>${more ? `<details><summary>Penjelasan lebih detail</summary><p>${esc(more)}</p></details>` : ''}</div></li>`).join('');
  const nav = document.querySelector('.nav nav'), bg = document.querySelector('.burger');
  bg.onclick = () => bg.setAttribute('aria-expanded', nav.classList.toggle('open'));
  nav.onclick = () => { nav.classList.remove('open'); bg.setAttribute('aria-expanded', false); };
  $('#open-arch').onclick = () => { guess(); $('#arch').showModal(); };
  try { cards(await (await fetch('/apk-config.json')).json()); } catch (e) { $('#cards').textContent = 'Gagal memuat daftar APK. Muat ulang halaman.'; }
  stats();
});

// cursor-following light on glass surfaces
document.addEventListener('pointermove', e => {
  const g = e.target.closest && e.target.closest('.glass,.card'); if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
