/* Pemutar langkah: maju, mundur, putar, jeda, dan lompat ke langkah tertentu. */
(function (global) {
  'use strict';

  // Langkah per detik.
  var KECEPATAN = [1, 2, 4, 8, 16];

  function Player(onTampil) {
    this.onTampil = onTampil; // Dipanggil setiap posisi berubah.
    this.steps = [];
    this.pos = 0;
    this.timer = null;
    this.tingkat = 2; // Bawaan 4 langkah/detik.
  }

  Player.prototype.muat = function (steps) {
    this.hentikan();
    this.steps = steps || [];
    this.pos = 0;
    this.tayang();
  };

  Player.prototype.langkahAktif = function () {
    if (!this.steps.length) return null;
    return this.steps[this.pos];
  };

  Player.prototype.apakahMain = function () {
    return this.timer !== null;
  };

  Player.prototype.intervalMs = function () {
    return Math.round(1000 / KECEPATAN[this.tingkat]);
  };

  // Mulai atau lanjutkan animasi.
  Player.prototype.main = function () {
    var self = this;
    if (self.apakahMain()) return;
    if (self.pos >= self.steps.length - 1) self.pos = 0; // putar ulang dari awal
    self.timer = setInterval(function () {
      if (self.pos >= self.steps.length - 1) {
        self.jeda();
        return;
      }
      self.pos++;
      self.tayang();
    }, self.intervalMs());
    self.tayang();
  };

  Player.prototype.jeda = function () {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.tayang();
  };

  // Ganti kecepatan tanpa menyisakan timer ganda.
  Player.prototype.aturKecepatan = function (tingkat) {
    var sedangMain = this.apakahMain();
    this.jeda();
    this.tingkat = Math.max(0, Math.min(KECEPATAN.length - 1, tingkat));
    if (sedangMain) this.main();
    else this.tayang();
  };

  // Maju satu langkah.
  Player.prototype.maju = function () {
    this.jeda();
    if (this.pos < this.steps.length - 1) this.pos++;
    this.tayang();
  };

  // Mundur satu langkah.
  Player.prototype.mundur = function () {
    this.jeda();
    if (this.pos > 0) this.pos--;
    this.tayang();
  };

  Player.prototype.lompatAkhir = function () {
    this.jeda();
    if (this.steps.length) this.pos = this.steps.length - 1;
    this.tayang();
  };

  // Lompat ke langkah tertentu dari scrubber.
  Player.prototype.ke = function (i) {
    this.jeda();
    if (!this.steps.length) return;
    this.pos = Math.max(0, Math.min(this.steps.length - 1, i || 0));
    this.tayang();
  };

  Player.prototype.reset = function () {
    this.jeda();
    this.pos = 0;
    this.tayang();
  };

  Player.prototype.hentikan = function () {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  Player.prototype.tayang = function () {
    if (typeof this.onTampil === 'function') {
      this.onTampil(this.langkahAktif(), this.pos, this.steps.length, this.apakahMain());
    }
  };

  global.Pemutar = Player;
  global.KECEPATAN_LANGKAH = KECEPATAN;
})(typeof window !== 'undefined' ? window : globalThis);
