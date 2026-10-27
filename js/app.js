/* Hubungkan tampilan dengan logika dan pemutar langkah. */
(function () {
  'use strict';

  var ALGO_LIST = ['bubble', 'selection', 'insertion', 'quick'];

  // Simpan pilihan algoritma, data, dan opsi yang sedang dipakai.
  var state = {
    algo: 'bubble',
    dataAwal: [5, 3, 8, 1, 9, 2, 7, 4],
    jumlah: 8,
    opsi: {}
  };

  var player = null;

  function $(id) { return document.getElementById(id); }

  // Buat data acak.
  function acakArray(n, min, max) {
    var a = [];
    for (var i = 0; i < n; i++) {
      a.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return a;
  }

  function presetData(jenis, n) {
    if (jenis === 'urut') {
      var a = acakArray(n, -20, 50);
      a.sort(function (x, y) { return x - y; });
      return a;
    }
    if (jenis === 'terbalik') {
      var b = acakArray(n, -20, 50);
      b.sort(function (x, y) { return y - x; });
      return b;
    }
    if (jenis === 'hampir') {
      var c = acakArray(n, 0, 40);
      c.sort(function (x, y) { return x - y; });
      for (var k = 0; k < Math.min(2, n - 1); k++) {
        var i = Math.floor(Math.random() * n);
        var j = Math.floor(Math.random() * n);
        var t = c[i]; c[i] = c[j]; c[j] = t;
      }
      return c;
    }
    if (jenis === 'duplikat') {
      var kecil = [1, 2, 3, 4, 5];
      var d = [];
      for (var q = 0; q < n; q++) d.push(kecil[Math.floor(Math.random() * kecil.length)]);
      return d;
    }
    return acakArray(n, 0, 30);
  }

  // Baca input manual yang dipisah koma.
  function parseManual(teks) {
    if (!teks || !teks.trim()) return { error: 'Kolom masih kosong. Contoh yang benar: 5, 3, 8, 1' };
    var bagian = teks.split(',');
    if (bagian.length < 2) return { error: 'Minimal 2 angka. Contoh: 5, 3, 8, 1' };
    if (bagian.length > 20) return { error: 'Maksimal 20 angka. Kamu memasukkan ' + bagian.length + '.' };
    var hasil = [];
    for (var i = 0; i < bagian.length; i++) {
      var s = bagian[i].trim();
      if (s === '') return { error: 'Ada koma ganda / angka kosong di posisi ' + (i + 1) + '.' };
      if (!/^-?\d+$/.test(s)) return { error: '"' + s + '" bukan bilangan bulat. Hanya boleh angka dan koma. Contoh: 5, 3, 8, 1' };
      var v = parseInt(s, 10);
      if (v < -99 || v > 99) return { error: 'Angka ' + v + ' di luar rentang -99 sampai 99.' };
      hasil.push(v);
    }
    return { data: hasil };
  }

  // Nilai opsi aktif untuk algoritma sekarang.
  function nilaiOpsi(meta) {
    if (!meta.opsi) return null;
    return state.opsi[meta.id] || meta.opsi.bawaan;
  }

  // Bangun tombol opsi dari data algoritma.
  function gambarOpsi(meta) {
    var blok = $('blok-opsi');
    var seg = $('segmen-opsi');
    seg.innerHTML = '';
    if (!meta.opsi) {
      blok.hidden = true;
      return;
    }
    blok.hidden = false;
    $('label-opsi').textContent = meta.opsi.label;
    seg.setAttribute('aria-label', meta.opsi.label);
    var aktif = nilaiOpsi(meta);
    meta.opsi.pilihan.forEach(function (pasangan) {
      var nilai = pasangan[0], teks = pasangan[1];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn segmen-btn';
      b.textContent = teks;
      var ini = nilai === aktif;
      b.setAttribute('aria-pressed', ini ? 'true' : 'false');
      if (ini) b.classList.add('aktif');
      b.addEventListener('click', function () {
        if (state.opsi[meta.id] === nilai) return;
        state.opsi[meta.id] = nilai;
        // Muat ulang langkah dari data yang sama.
        muatSimulasi();
      });
      seg.appendChild(b);
    });
  }

  // Muat ulang simulasi saat data, tab, atau opsi berganti.
  function muatSimulasi() {
    var meta = window.Algoritma[state.algo];
    gambarOpsi(meta);
    player.muat(meta.buatLangkah(state.dataAwal, nilaiOpsi(meta)));
    window.Render.gambarLegenda($('legenda'), meta.legenda);
    gambarKompleksitas();
    $('ide-algo').textContent = 'Ide: ' + meta.ide;
    $('kapan-algo').textContent = meta.kapan;
  }

  function gambarKompleksitas() {
    var meta = window.Algoritma[state.algo];
    var k = meta.kompleksitas;
    $('cx-terbaik').textContent = k.terbaik;
    $('cx-rata').textContent = k.rata;
    $('cx-buruk').textContent = k.terburuk;
    $('cx-memori').textContent = k.memori;
    $('cx-stabil').textContent = k.stabil;
  }

  // Tampilkan satu langkah ke layar.
  function tampilkan(step, pos, total, sedangMain) {
    var meta = window.Algoritma[state.algo];
    window.Render.gambarBatang($('area-batang'), step, state.algo === 'insertion');
    window.Render.gambarVariabel($('panel-var'), step ? step.vars : {}, meta.variabel);
    if (state.algo === 'quick') {
      $('blok-stack').hidden = false;
      window.Render.gambarTumpukan($('panel-stack'), step ? step.stack : []);
    } else {
      $('blok-stack').hidden = true;
    }
    // Penjelasan langkah.
    $('penjelasan').textContent = step ? step.note : 'Siap.';
    // Posisi langkah.
    $('langkah-info').textContent = total ? ((pos + 1) + ' / ' + total) : '0 / 0';
    // Angka langkah dan penghitung.
    if (step) {
      $('stat-langkah').textContent = pos + 1;
      $('hit-banding').textContent = step.counters.compare;
      $('hit-tukar').textContent = step.counters.swap;
      $('hit-tulis').textContent = step.counters.write;
    }
    // Scrubber mengikuti posisi, kecuali saat sedang diseret.
    var scrub = $('scrub');
    scrub.max = total ? String(total - 1) : '0';
    if (document.activeElement !== scrub) scrub.value = String(pos);
    // Tombol putar/jeda.
    var main = sedangMain;
    $('teks-play').textContent = main ? 'Jeda' : 'Putar';
    $('ikon-play').hidden = main;
    $('ikon-jeda').hidden = !main;
    $('btn-play').setAttribute('aria-label', main ? 'Jeda animasi (Spasi)' : 'Putar animasi (Spasi)');
    $('btn-back').disabled = pos <= 0;
    $('btn-step').disabled = pos >= total - 1;
  }

  function aturTab(id) {
    player.hentikan();
    state.algo = id;
    ALGO_LIST.forEach(function (a) {
      var t = $('tab-' + a);
      if (t) {
        var aktif = a === id;
        t.classList.toggle('aktif', aktif);
        t.setAttribute('aria-selected', aktif ? 'true' : 'false');
      }
    });
    muatSimulasi();
  }

  function aturJumlah(n) {
    state.jumlah = Math.max(5, Math.min(20, n));
    $('jumlah-nilai').textContent = state.jumlah;
  }

  function init() {
    player = new window.Pemutar(tampilkan);

    // Tab algoritma.
    ALGO_LIST.forEach(function (a) {
      $('tab-' + a).addEventListener('click', function () { aturTab(a); });
    });

    // Toolbar data.
    aturJumlah(state.jumlah);
    $('btn-acak').addEventListener('click', function () {
      state.dataAwal = acakArray(state.jumlah, 0, 30);
      $('input-manual').value = state.dataAwal.join(', ');
      sembunyikanGalat();
      muatSimulasi();
    });
    $('preset').addEventListener('change', function (e) {
      state.dataAwal = presetData(e.target.value, state.jumlah);
      $('input-manual').value = state.dataAwal.join(', ');
      sembunyikanGalat();
      muatSimulasi();
    });
    $('jml-kurang').addEventListener('click', function () { aturJumlah(state.jumlah - 1); });
    $('jml-tambah').addEventListener('click', function () { aturJumlah(state.jumlah + 1); });
    $('btn-terapkan').addEventListener('click', function () {
      var hasil = parseManual($('input-manual').value);
      if (hasil.error) {
        tampilkanGalat(hasil.error);
        return;
      }
      sembunyikanGalat();
      state.dataAwal = hasil.data;
      aturJumlah(hasil.data.length);
      muatSimulasi();
    });

    // Scrubber langkah.
    $('scrub').addEventListener('input', function (e) {
      player.ke(parseInt(e.target.value, 10));
    });

    // Kontrol putar.
    $('btn-play').addEventListener('click', function () {
      if (player.apakahMain()) player.jeda();
      else player.main();
    });
    $('btn-back').addEventListener('click', function () { player.mundur(); });
    $('btn-step').addEventListener('click', function () { player.maju(); });
    $('btn-end').addEventListener('click', function () { player.lompatAkhir(); });
    $('btn-reset').addEventListener('click', function () { player.reset(); });
    $('kecepatan').addEventListener('change', function (e) {
      player.aturKecepatan(parseInt(e.target.value, 10));
    });

    // Keyboard: abaikan saat mengetik di input.
    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key !== 'Escape') return;
      }
      if (e.code === 'Space') { e.preventDefault(); if (player.apakahMain()) player.jeda(); else player.main(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); player.maju(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); player.mundur(); }
      else if (e.key === 'r' || e.key === 'R') { player.reset(); }
    });

    $('input-manual').value = state.dataAwal.join(', ');
    muatSimulasi();
  }

  function tampilkanGalat(pesan) {
    var el = $('pesan-galat');
    el.textContent = pesan;
    el.hidden = false;
  }
  function sembunyikanGalat() {
    var el = $('pesan-galat');
    el.textContent = '';
    el.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
