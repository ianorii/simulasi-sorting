/* Logika algoritma pengurutan. Tiap fungsi mengembalikan daftar langkah. */
(function (global) {
  'use strict';

  // Format langkah yang dipakai tampilan.
  function buatLangkah(opt) {
    return {
      type: opt.type,
      indices: opt.indices ? opt.indices.slice() : [],
      array: opt.array.slice(),
      sorted: opt.sorted ? opt.sorted.slice() : [],
      vars: opt.vars ? Object.assign({}, opt.vars) : {},
      note: opt.note || '',
      counters: {
        compare: opt.counters.compare,
        swap: opt.counters.swap,
        write: opt.counters.write
      },
      // Data khusus Quick Sort.
      range: opt.range ? opt.range.slice() : null,
      stack: opt.stack ? opt.stack.slice() : [],
      pivotAt: (typeof opt.pivotAt === 'number') ? opt.pivotAt : null
    };
  }

  // Salin array agar data asli tidak berubah.
  function salin(a) { return a.slice(); }

  // Bubble Sort
  function bubbleSteps(input) {
    // Variabel awal.
    var a = salin(input);
    var n = a.length;
    var steps = [];
    var c = { compare: 0, swap: 0, write: 0 };
    var sorted = [];
    steps.push(buatLangkah({
      type: 'init', indices: [], array: a, sorted: sorted,
      vars: {},
      note: 'Mulai Bubble Sort dengan ' + n + ' elemen. Kita bandingkan pasangan bersebelahan.',
      counters: c, stack: []
    }));
    // Ulangi sampai semua elemen terurut.
    for (var i = 0; i < n - 1; i++) {
      // Penanda apakah putaran ini ada pertukaran.
      var swapped = false;
      steps.push(buatLangkah({
        type: 'range', indices: [], array: a, sorted: sorted,
        vars: { i: i, swapped: false },
        note: 'Putaran ke-' + (i + 1) + '. Anggap belum ada pertukaran (swapped = salah).',
        counters: c, stack: []
      }));
      // Bandingkan elemen dengan tetangganya.
      for (var j = 0; j < n - 1 - i; j++) {
        c = { compare: c.compare + 1, swap: c.swap, write: c.write };
        var v1 = a[j], v2 = a[j + 1];
        if (v1 > v2) {
          steps.push(buatLangkah({
            type: 'compare', indices: [j, j + 1], array: a, sorted: sorted,
            vars: { i: i, j: j, swapped: swapped },
            note: 'Bandingkan ' + v1 + ' dan ' + v2 + '. Karena ' + v1 + ' lebih besar dari ' + v2 + ', keduanya akan ditukar.',
            counters: c, stack: []
          }));
          // Tukar posisi.
          var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
          swapped = true;
          c = { compare: c.compare, swap: c.swap + 1, write: c.write };
          steps.push(buatLangkah({
            type: 'swap', indices: [j, j + 1], array: a, sorted: sorted,
            vars: { i: i, j: j, swapped: swapped },
            note: 'Tukar ' + v1 + ' dan ' + v2 + '. Sekarang urutannya ' + a[j] + ', ' + a[j + 1] + '.',
            counters: c, stack: []
          }));
        } else {
          steps.push(buatLangkah({
            type: 'compare', indices: [j, j + 1], array: a, sorted: sorted,
            vars: { i: i, j: j, swapped: swapped },
            note: 'Bandingkan ' + v1 + ' dan ' + v2 + '. Sudah urut, jadi tidak ditukar.',
            counters: c, stack: []
          }));
        }
      }
      // Elemen paling kanan sudah final.
      sorted = sorted.concat([n - 1 - i]);
      sorted.sort(function (x, y) { return x - y; });
      steps.push(buatLangkah({
        type: 'pass-end', indices: [n - 1 - i], array: a, sorted: sorted,
        vars: { i: i, swapped: swapped },
        note: swapped
          ? 'Putaran ' + (i + 1) + ' selesai. Elemen ' + a[n - 1 - i] + ' sudah di posisi final.'
          : 'Putaran ' + (i + 1) + ' selesai tanpa pertukaran. Berarti array sudah urut, berhenti lebih awal.',
        counters: c, stack: []
      }));
      if (!swapped) break;
    }
    var all = [];
    for (var k = 0; k < n; k++) all.push(k);
    steps.push(buatLangkah({
      type: 'done', indices: [], array: a, sorted: all,
      vars: {}, note: 'Selesai! Array sudah urut dari kecil ke besar.',
      counters: c, stack: []
    }));
    return steps;
  }

  // Selection Sort
  function selectionSteps(input) {
    // Variabel awal.
    var a = salin(input);
    var n = a.length;
    var steps = [];
    var c = { compare: 0, swap: 0, write: 0 };
    var sorted = [];
    steps.push(buatLangkah({
      type: 'init', indices: [], array: a, sorted: sorted,
      vars: {},
      note: 'Mulai Selection Sort. Kita cari yang terkecil lalu taruh di depan.',
      counters: c, stack: []
    }));
    for (var i = 0; i < n - 1; i++) {
      // Anggap elemen pertama sebagai yang terkecil.
      var minIdx = i;
      steps.push(buatLangkah({
        type: 'select', indices: [i], array: a, sorted: sorted,
        vars: { i: i, minIdx: minIdx },
        note: 'Putaran ke-' + (i + 1) + '. Anggap ' + a[i] + ' di indeks ' + i + ' sebagai yang terkecil sementara.',
        counters: c, stack: []
      }));
      // Cari nilai terkecil di sisa array.
      for (var j = i + 1; j < n; j++) {
        c = { compare: c.compare + 1, swap: c.swap, write: c.write };
        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push(buatLangkah({
            type: 'select', indices: [j], array: a, sorted: sorted,
            vars: { i: i, j: j, minIdx: minIdx },
            note: 'Ketemu ' + a[j] + ' di indeks ' + j + ' yang lebih kecil. Jadi min_idx pindah ke ' + j + '.',
            counters: c, stack: []
          }));
        } else {
          steps.push(buatLangkah({
            type: 'compare', indices: [j, minIdx], array: a, sorted: sorted,
            vars: { i: i, j: j, minIdx: minIdx },
            note: 'Bandingkan ' + a[j] + ' dengan terkecil sementara ' + a[minIdx] + '. Tidak lebih kecil, min_idx tetap.',
            counters: c, stack: []
          }));
        }
      }
      if (minIdx !== i) {
        // Tukar minimum ke posisi i.
        var t = a[i]; a[i] = a[minIdx]; a[minIdx] = t;
        c = { compare: c.compare, swap: c.swap + 1, write: c.write };
        steps.push(buatLangkah({
          type: 'swap', indices: [i, minIdx], array: a, sorted: sorted,
          vars: { i: i, minIdx: minIdx },
          note: 'Tukar ' + a[minIdx] + ' dengan terkecil ' + a[i] + '. Posisi ' + i + ' sekarang benar.',
          counters: c, stack: []
        }));
      } else {
        steps.push(buatLangkah({
          type: 'select', indices: [i], array: a, sorted: sorted,
          vars: { i: i, minIdx: minIdx },
          note: 'Yang terkecil sudah di posisi ' + i + '. Tidak perlu tukar.',
          counters: c, stack: []
        }));
      }
      sorted.push(i);
      steps.push(buatLangkah({
        type: 'mark-sorted', indices: [i], array: a, sorted: sorted.slice(),
        vars: { i: i },
        note: 'Indeks ' + i + ' (nilai ' + a[i] + ') sudah final.',
        counters: c, stack: []
      }));
    }
    sorted.push(n - 1);
    var all = [];
    for (var k = 0; k < n; k++) all.push(k);
    steps.push(buatLangkah({
      type: 'done', indices: [], array: a, sorted: all,
      vars: {}, note: 'Selesai! Array sudah urut dari kecil ke besar.',
      counters: c, stack: []
    }));
    return steps;
  }

  // Insertion Sort
  function insertionSteps(input) {
    // Variabel awal.
    var a = salin(input);
    var n = a.length;
    var steps = [];
    var c = { compare: 0, swap: 0, write: 0 };
    var sorted = n > 0 ? [0] : [];
    steps.push(buatLangkah({
      type: 'init', indices: [], array: a, sorted: sorted.slice(),
      vars: {},
      note: 'Mulai Insertion Sort. Bagian kiri dianggap sudah urut, mulai dari indeks 0.',
      counters: c, stack: []
    }));
    for (var i = 1; i < n; i++) {
      // Ambil key dan mulai dari elemen di kirinya.
      var key = a[i];
      var j = i - 1;
      steps.push(buatLangkah({
        type: 'select', indices: [i], array: a, sorted: sorted.slice(),
        vars: { i: i, key: key, j: j },
        note: 'Ambil ' + key + ' sebagai key (kartu di tangan). Cari tempatnya di kiri.',
        counters: c, stack: []
      }));
      var moved = false;
      while (j >= 0) {
        c = { compare: c.compare + 1, swap: c.swap, write: c.write };
        if (a[j] > key) {
          // Geser elemen yang lebih besar ke kanan.
          a[j + 1] = a[j];
          c = { compare: c.compare, swap: c.swap, write: c.write + 1 };
          steps.push(buatLangkah({
            type: 'write', indices: [j, j + 1], array: a, sorted: sorted.slice(),
            vars: { i: i, key: key, j: j },
            note: 'Geser ' + a[j + 1] + ' ke kanan karena lebih besar dari key ' + key + '.',
            counters: c, stack: []
          }));
          j--;
          moved = true;
        } else {
          steps.push(buatLangkah({
            type: 'compare', indices: [j], array: a, sorted: sorted.slice(),
            vars: { i: i, key: key, j: j },
            note: a[j] + ' tidak lebih besar dari key ' + key + '. Berhenti menggeser.',
            counters: c, stack: []
          }));
          break;
        }
      }
      // Taruh key di posisi yang kosong.
      a[j + 1] = key;
      // Penempatan key dihitung sebagai penulisan jika ada pergeseran.
      if (moved) c = { compare: c.compare, swap: c.swap, write: c.write + 1 };
      sorted.push(i);
      sorted.sort(function (x, y) { return x - y; });
      // Tandai bagian kiri yang sudah urut.
      var leftSorted = [];
      for (var s = 0; s <= i; s++) leftSorted.push(s);
      steps.push(buatLangkah({
        type: 'write', indices: [j + 1], array: a, sorted: leftSorted,
        vars: { i: i, key: key, j: j + 1 },
        note: moved
          ? 'Taruh key ' + key + ' di indeks ' + (j + 1) + '. Bagian kiri 0..' + i + ' sekarang urut.'
          : 'Key ' + key + ' sudah di tempat yang benar. Lanjut.',
        counters: c, stack: []
      }));
    }
    var all = [];
    for (var k = 0; k < n; k++) all.push(k);
    steps.push(buatLangkah({
      type: 'done', indices: [], array: a, sorted: all,
      vars: {}, note: 'Selesai! Array sudah urut dari kecil ke besar.',
      counters: c, stack: []
    }));
    return steps;
  }

  // Quick Sort
  // Varian pivot yang tersedia. Tambah varian baru di sini dan di `opsi`
  // pada REGISTRY.
  var QUICK_VARIAN = {
    kanan: { nama: 'pivot kanan', arah: 'kanan' },
    tengah: { nama: 'pivot tengah', arah: 'tengah' },
    kiri: { nama: 'pivot kiri', arah: 'kiri' }
  };
  function quickSteps(input, varian) {
    var cfg = QUICK_VARIAN[varian] || QUICK_VARIAN.kanan;
    var mode = cfg.arah;
    var pivotTengah = mode === 'tengah';
    // Pivot tengah dipindah ke ujung kanan agar partisi memakai aturan Lomuto.
    var arahKanan = mode !== 'kiri';
    var namaPivot = cfg.nama;
    // Variabel awal.
    var a = salin(input);
    var steps = [];
    var c = { compare: 0, swap: 0, write: 0 };
    var sorted = [];

    steps.push(buatLangkah({
      type: 'init', indices: [], array: a, sorted: [],
      vars: { low: 0, high: a.length - 1 },
      note: 'Mulai Quick Sort (varian pivot ' + mode + '). Pivot tiap rentang diambil dari ' +
        (pivotTengah ? 'elemen tengah rentang' : 'elemen paling ' + mode + ' rentang') + '.',
      counters: c, stack: [[0, a.length - 1]]
    }));

    // Bagi array menjadi bagian kiri (kecil) dan kanan (besar).
    function partisi(low, high, callStack) {
      // Pivot kanan/kiri ada di ujung; pivot tengah dicari dulu.
      var pIdx = pivotTengah ? Math.floor((low + high) / 2) : (arahKanan ? high : low);
      var pivot = a[pIdx];
      // Batas bagian kecil.
      var i = arahKanan ? low - 1 : low;
      steps.push(buatLangkah({
        type: 'range', indices: [pIdx], array: a, sorted: sorted.slice(),
        vars: { pivot: pivot, low: low, high: high, i: i },
        range: [low, high], pivotAt: pIdx,
        note: 'Rentang [' + low + '..' + high + ']. Pivot ' + mode + ' adalah ' + pivot +
          (pivotTengah
            ? ' di indeks tengah ' + pIdx + '. Pivot akan dipindah ke ujung kanan agar partisi mudah.'
            : ' (elemen paling ' + mode + ' rentang). Semua yang lebih kecil pindah ke kiri.'),
        counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
      }));
      // Pindahkan pivot tengah ke ujung kanan.
      if (pivotTengah && pIdx !== high) {
        var asalPivot = pIdx;
        var nilaiPivot = a[asalPivot];
        var nilaiHigh = a[high];
        a[high] = nilaiPivot;
        a[asalPivot] = nilaiHigh;
        pIdx = high;
        c = { compare: c.compare, swap: c.swap + 1, write: c.write };
        steps.push(buatLangkah({
          type: 'swap', indices: [asalPivot, high], array: a, sorted: sorted.slice(),
          vars: { pivot: pivot, low: low, high: high, i: i },
          range: [low, high], pivotAt: pIdx,
          note: 'Pindahkan pivot tengah ' + pivot + ' dari indeks ' + asalPivot +
            ' ke indeks ' + high + '. Elemen ' + nilaiHigh + ' mengisi indeks ' + asalPivot + '.',
          counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
        }));
      }
      var jAwal = arahKanan ? low : low + 1;
      var jAkhir = arahKanan ? high - 1 : high;
      for (var j = jAwal; j <= jAkhir; j++) {
        c = { compare: c.compare + 1, swap: c.swap, write: c.write };
        // Nilai yang sama dengan pivot tidak dipindah.
        if (a[j] < pivot) {
          var target = i + 1;
          steps.push(buatLangkah({
            type: 'compare', indices: [j, pIdx], array: a, sorted: sorted.slice(),
            vars: { pivot: pivot, low: low, high: high, i: i, j: j },
            range: [low, high], pivotAt: pIdx,
            note: a[j] + ' lebih kecil dari ' + namaPivot + ' ' + pivot + '. ' +
              (target === j ? 'Sudah berada di batas.' : 'Pindah ke indeks ' + target + '.'),
            counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
          }));
          i = target;
          if (i !== j) {
            var nilaiI = a[i], nilaiJ = a[j];
            a[i] = nilaiJ; a[j] = nilaiI;
            c = { compare: c.compare, swap: c.swap + 1, write: c.write };
            steps.push(buatLangkah({
              type: 'swap', indices: [i, j], array: a, sorted: sorted.slice(),
              vars: { pivot: pivot, low: low, high: high, i: i, j: j },
              range: [low, high], pivotAt: pIdx,
              note: 'Tukar ' + nilaiI + ' dengan ' + nilaiJ + '. Batas kecil kini di indeks ' + i + '.',
              counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
            }));
          }
        } else {
          steps.push(buatLangkah({
            type: 'compare', indices: [j, pIdx], array: a, sorted: sorted.slice(),
            vars: { pivot: pivot, low: low, high: high, i: i, j: j },
            range: [low, high], pivotAt: pIdx,
            note: a[j] + ' tidak lebih kecil dari ' + namaPivot + ' ' + pivot + '. Biarkan di tempatnya.',
            counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
          }));
        }
      }
      // Posisi final pivot.
      var pos = arahKanan ? i + 1 : i;
      var perluTukar = pos !== pIdx;
      if (perluTukar) {
        var t = a[pos]; a[pos] = a[pIdx]; a[pIdx] = t;
        c = { compare: c.compare, swap: c.swap + 1, write: c.write };
      }
      sorted.push(pos);
      sorted.sort(function (x, y) { return x - y; });
      steps.push(buatLangkah({
        type: 'swap', indices: [pos], array: a, sorted: sorted.slice(),
        vars: { pivot: pivot, low: low, high: high, i: arahKanan ? pos - 1 : pos },
        range: [low, high], pivotAt: pos,
        note: perluTukar
          ? 'Taruh ' + namaPivot + ' ' + pivot + ' di indeks ' + pos + '. Pivot sudah di posisi final.'
          : 'Pivot ' + mode + ' ' + pivot + ' sudah di posisi final (indeks ' + pos + ').',
        counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
      }));
      return pos;
    }

    // Proses rentang kiri dan kanan secara rekursif.
    function rekursi(low, high, callStack) {
      if (low >= high) {
        if (low === high && sorted.indexOf(low) === -1) {
          sorted.push(low);
          sorted.sort(function (x, y) { return x - y; });
          steps.push(buatLangkah({
            type: 'mark-sorted', indices: [low], array: a, sorted: sorted.slice(),
            vars: { low: low, high: high }, range: [low, high],
            note: 'Satu elemen saja di indeks ' + low + '. Sudah pasti benar.',
            counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: callStack.slice()
          }));
        }
        return;
      }
      var p = partisi(low, high, callStack);
      var kiri = [];
      if (low <= p - 1) kiri = [low, p - 1];
      var kanan = [];
      if (p + 1 <= high) kanan = [p + 1, high];
      var nextStack = callStack.slice();
      nextStack.pop();
      if (kanan.length) nextStack.push(kanan);
      if (kiri.length) nextStack.push(kiri);
      steps.push(buatLangkah({
        type: 'range', indices: [], array: a, sorted: sorted.slice(),
        vars: { low: low, high: high }, range: [low, high],
        note: 'Pivot di ' + p + '. Lanjut ke kiri [' + low + '..' + (p - 1) + '] lalu kanan [' + (p + 1) + '..' + high + '].',
        counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: nextStack.slice()
      }));
      if (kiri.length) rekursi(kiri[0], kiri[1], nextStack.slice());
      if (kanan.length) {
        var st2 = nextStack.slice();
        rekursi(kanan[0], kanan[1], st2.slice());
      }
    }

    if (a.length > 1) rekursi(0, a.length - 1, [[0, a.length - 1]]);
    else if (a.length === 1) sorted.push(0);

    var all = [];
    for (var k = 0; k < a.length; k++) all.push(k);
    steps.push(buatLangkah({
      type: 'done', indices: [], array: a, sorted: all,
      vars: {}, note: 'Selesai! Semua pivot sudah di posisi final. Array urut.',
      counters: { compare: c.compare, swap: c.swap, write: c.write }, stack: []
    }));
    return steps;
  }

  var REGISTRY = {
    bubble: {
      id: 'bubble', nama: 'Bubble Sort',
      ide: 'Bandingkan tetangga, tukar jika salah urutan. Yang besar tenggelam ke kanan tiap putaran.',
      kapan: 'Bagus untuk data kecil atau hampir urut (berhenti cepat). Buruk untuk data besar acak.',
      kompleksitas: { terbaik: 'O(n)', rata: 'O(n²)', terburuk: 'O(n²)', memori: 'O(1)', stabil: 'Ya' },
      // [kunci data, label tampilan]
      variabel: [['i', 'i'], ['j', 'j'], ['swapped', 'swapped']],
      legenda: [['netral', 'Belum disentuh'], ['banding', 'Dibandingkan'], ['tukar', 'Ditukar / ditulis'], ['final', 'Sudah final']],
      buatLangkah: bubbleSteps
    },
    selection: {
      id: 'selection', nama: 'Selection Sort',
      ide: 'Cari yang terkecil di bagian belum urut, tukar ke depan. Satu tukar per putaran.',
      kapan: 'Bagus jika tukar itu mahal (sedikit tukar). Buruk karena selalu cek semua walau sudah urut.',
      kompleksitas: { terbaik: 'O(n²)', rata: 'O(n²)', terburuk: 'O(n²)', memori: 'O(1)', stabil: 'Tidak' },
      variabel: [['i', 'i'], ['j', 'j'], ['minIdx', 'min_idx']],
      legenda: [['netral', 'Belum disentuh'], ['banding', 'Dibandingkan'], ['tukar', 'Ditukar / ditulis'], ['kunci', 'Minimum'], ['final', 'Sudah final']],
      buatLangkah: selectionSteps
    },
    insertion: {
      id: 'insertion', nama: 'Insertion Sort',
      ide: 'Seperti merapikan kartu: ambil satu (key), geser yang besar ke kanan, selipkan key.',
      kapan: 'Bagus untuk data kecil atau hampir urut. Buruk untuk data besar terbalik (banyak geser).',
      kompleksitas: { terbaik: 'O(n)', rata: 'O(n²)', terburuk: 'O(n²)', memori: 'O(1)', stabil: 'Ya' },
      variabel: [['i', 'i'], ['j', 'j'], ['key', 'key']],
      legenda: [['netral', 'Belum disentuh'], ['banding', 'Dibandingkan'], ['tukar', 'Ditukar / ditulis'], ['kunci', 'Key'], ['final', 'Sudah final']],
      buatLangkah: insertionSteps
    },
    quick: {
      id: 'quick', nama: 'Quick Sort',
      ide: 'Pilih pivot (kiri, tengah, atau kanan), kelompokkan yang kecil ke kiri. Lalu ulangi untuk kiri dan kanan.',
      kapan: 'Bagus dan cepat untuk data besar pada umumnya. Pivot tengah lebih aman untuk data yang sudah urut; pivot ujung bisa jadi O(n²) pada data urut. Catatan: ada skema lain seperti Hoare dan median-of-three.',
      // Pilihan pivot yang tampil di UI.
      opsi: {
        label: 'Pilihan pivot',
        pilihan: [['kanan', 'Pivot kanan'], ['tengah', 'Pivot tengah'], ['kiri', 'Pivot kiri']],
        bawaan: 'kanan'
      },
      kompleksitas: { terbaik: 'O(n log n)', rata: 'O(n log n)', terburuk: 'O(n²)', memori: 'O(log n) rata-rata', stabil: 'Tidak' },
      variabel: [['low', 'low'], ['high', 'high'], ['pivot', 'pivot'], ['i', 'i'], ['j', 'j']],
      legenda: [['netral', 'Belum disentuh'], ['banding', 'Dibandingkan'], ['tukar', 'Ditukar / ditulis'], ['pivot', 'Pivot'], ['final', 'Sudah final']],
      buatLangkah: function (data, opsi) { return quickSteps(data, opsi); }
    }
  };

  global.Algoritma = REGISTRY;
})(typeof window !== 'undefined' ? window : globalThis);
