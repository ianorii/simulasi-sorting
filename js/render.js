/* Gambar batang, variabel, legenda, dan tumpukan rekursi. */
(function (global) {
  'use strict';

  var WARNA_INFO = {
    netral: { label: 'Belum disentuh' },
    banding: { label: 'Dibandingkan' },
    tukar: { label: 'Ditukar / ditulis' },
    kunci: { label: 'Key / minimum' },
    pivot: { label: 'Pivot' },
    final: { label: 'Sudah final' }
  };

  // Tentukan warna tiap batang dari jenis langkah.
  function peranIndeks(step) {
    var peran = {};
    if (!step) return peran;
    var vars = step.vars || {};
    (step.indices || []).forEach(function (ix) {
      if (step.type === 'swap' || step.type === 'write') peran[ix] = 'tukar';
      else if (step.type === 'compare') peran[ix] = 'banding';
      else if (step.type === 'select') peran[ix] = 'kunci';
      else peran[ix] = 'banding';
    });
    if (vars.minIdx !== undefined && peran[vars.minIdx] === undefined) peran[vars.minIdx] = 'kunci';
    // Pivot tetap ditandai, termasuk setelah pindah ke posisi final.
    if (vars.pivot !== undefined && typeof step.pivotAt === 'number') {
      peran[step.pivotAt] = 'pivot';
    }
    (step.sorted || []).forEach(function (ix) {
      if (peran[ix] === undefined) peran[ix] = 'final';
    });
    return peran;
  }

  // Gambar batang; tinggi mengikuti nilai.
  function gambarBatang(el, step, keyNaik) {
    if (!el) return;
    el.innerHTML = '';
    if (!step || !step.array || !step.array.length) return;
    var arr = step.array;
    var peran = peranIndeks(step);
    var vars = step.vars || {};
    var lo = Math.min.apply(null, [0].concat(arr));
    var hi = Math.max.apply(null, [0].concat(arr));
    if (hi === lo) hi = lo + 1;
    var rentang = hi - lo;
    var nolBawah = (0 - lo) / rentang * 100; // posisi garis nol dari bawah (%)
    var adaNegatif = lo < 0;

    arr.forEach(function (nilai, ix) {
      var peranIx = peran[ix] || 'netral';
      var sel = document.createElement('div');
      sel.className = 'sel-batang';

      var angka = document.createElement('span');
      angka.className = 'angka-sel';
      angka.textContent = nilai;
      sel.appendChild(angka);

      var rel = document.createElement('div');
      rel.className = 'rel-batang';
      if (adaNegatif) {
        var nol = document.createElement('div');
        nol.className = 'nol';
        nol.style.bottom = nolBawah + '%';
        rel.appendChild(nol);
      }

      var tinggi, bawah;
      if (nilai >= 0) {
        tinggi = nilai / rentang * 100;
        bawah = nolBawah;
      } else {
        tinggi = (-nilai) / rentang * 100;
        bawah = nolBawah - tinggi;
      }
      if (nilai !== 0 && tinggi < 2) tinggi = 2; // batang kecil tetap terlihat

      var batang = document.createElement('div');
      batang.className = 'batang peran-' + peranIx;
      var keyAktif = keyNaik && step.type === 'select' && vars.key !== undefined &&
        nilai === vars.key && peranIx === 'kunci';
      if (keyAktif) batang.classList.add('terangkat');
      batang.style.bottom = bawah + '%';
      batang.style.height = tinggi + '%';
      batang.setAttribute('role', 'img');
      batang.setAttribute('aria-label', 'indeks ' + ix + ' nilai ' + nilai +
        ' status ' + (WARNA_INFO[peranIx] ? WARNA_INFO[peranIx].label : peranIx));
      if (step.range && ix >= step.range[0] && ix <= step.range[1]) {
        batang.classList.add('dalam-rentang');
      }
      // Huruf penanda status, supaya tidak hanya bergantung pada warna.
      var tandaStatus = { banding: 'B', tukar: 'T', kunci: 'K', pivot: 'P', final: '✓', netral: '' }[peranIx] || '';
      if (tandaStatus) {
        var tanda = document.createElement('span');
        tanda.className = 'tanda';
        tanda.setAttribute('aria-hidden', 'true');
        tanda.textContent = tandaStatus;
        if (nilai >= 0) tanda.style.top = '3px';
        else tanda.style.bottom = '3px';
        batang.appendChild(tanda);
      }
      rel.appendChild(batang);
      sel.appendChild(rel);

      var idx = document.createElement('div');
      idx.className = 'indeks-batang';
      idx.textContent = ix;
      sel.appendChild(idx);
      el.appendChild(sel);
    });
  }

  // Tampilkan variabel langkah; yang belum ada diisi "-".
  function gambarVariabel(el, vars, daftar) {
    if (!el) return;
    el.innerHTML = '';
    (daftar || []).forEach(function (pasangan) {
      var kunci = pasangan[0], tampil = pasangan[1];
      var ada = vars && vars[kunci] !== undefined;
      var nilai = ada ? vars[kunci] : null;
      var teks = !ada ? '-' : (nilai === true ? 'benar' : (nilai === false ? 'salah' : String(nilai)));
      var baris = document.createElement('div');
      baris.className = 'var-baris' + (ada ? '' : ' kosong');
      var n = document.createElement('span');
      n.className = 'var-nama';
      n.textContent = tampil;
      var v = document.createElement('span');
      v.className = 'var-nilai';
      v.textContent = teks;
      baris.appendChild(n);
      baris.appendChild(v);
      el.appendChild(baris);
    });
  }

  // Legenda warna tiap algoritma.
  function gambarLegenda(el, daftar) {
    if (!el) return;
    el.innerHTML = '';
    (daftar || []).forEach(function (pasangan) {
      var kunci = pasangan[0], label = pasangan[1];
      var item = document.createElement('span');
      item.className = 'legenda-item';
      var sw = document.createElement('i');
      sw.className = 'swatch ' + kunci;
      sw.setAttribute('aria-hidden', 'true');
      item.appendChild(sw);
      item.appendChild(document.createTextNode(label));
      el.appendChild(item);
    });
  }

  // Tumpukan rekursi Quick Sort.
  function gambarTumpukan(el, stack) {
    if (!el) return;
    el.innerHTML = '';
    if (!stack || !stack.length) {
      el.textContent = 'Tumpukan kosong (selesai / belum mulai).';
      return;
    }
    el.textContent = stack.map(function (r) { return 'quick_sort(' + r[0] + ', ' + r[1] + ')'; }).join(' → ');
  }

  global.Render = {
    gambarBatang: gambarBatang,
    gambarVariabel: gambarVariabel,
    gambarLegenda: gambarLegenda,
    gambarTumpukan: gambarTumpukan,
    WARNA_INFO: WARNA_INFO
  };
})(typeof window !== 'undefined' ? window : globalThis);
