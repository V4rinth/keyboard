/* ════════════════════════════════════════════════════════════════
   MrVarinth — Seviye Sistemi (Yönetici Modülü)
   --------------------------------------------------------------
   Bu dosya seviye/XP/rütbe ayarlarını ve "Levelleri Sıfırla"
   özelliğini barındırır. Şifre ile korunur.

   ÖNEMLİ — DÜRÜST UYARI:
   Bu sadece istemci (tarayıcı) tarafında çalışan bir JS dosyasıdır.
   Şifre düz metin olarak değil SHA-256 özeti (hash) olarak tutulur,
   bu yüzden dosyayı açan biri şifreyi doğrudan okuyamaz — ama bu
   "gerçek" bir erişim kontrolü DEĞİLDİR, sadece rastgele birinin
   tesadüfen sıfırlama yapmasını engelleyen bir caydırıcıdır. Bu
   klasörün kendisine kimin yazma/değiştirme erişimi olduğu (yani
   "sadece ben girebilirim" kısmı) hosting/GitHub/FTP erişim
   ayarlarınla ilgilidir, bu dosyanın içeriğiyle değil.

   ŞİFREYİ DEĞİŞTİRMEK İÇİN:
   1) Tarayıcı konsolunu aç (F12 → Console)
   2) Şunu yapıştırıp Enter'a bas (yeniSifrem yerine kendi şifreni yaz):
        crypto.subtle.digest("SHA-256", new TextEncoder().encode("yeniSifrem"))
          .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")))
   3) Çıkan uzun harf/rakam dizisini aşağıdaki YONETICI_SIFRE_HASH
      değerinin yerine yapıştır.

   VARSAYILAN ŞİFRE: MrVarinth-Kurucu-2026   (lütfen değiştir!)
   ════════════════════════════════════════════════════════════════ */

const YONETICI_SIFRE_HASH = "9e18a52ce6b9bedaead6bfb8a5d4f49af83f14baf0c330c604960df453ab6db8";

/* ── Seviye / Kilit / Rütbe ayarları (artık burada yönetiliyor) ── */
const V4rinthSeviyeAyarlari = {
    DIFF_UNLOCK_LEVEL: { 0:1, 11:1, 1:3, 2:7, 3:12, 4:18, 6:22, 5:25 },
    ALWAYS_OPEN_DIFFS: [0, 11],
    RANKS: [
        { name:"Acemi",     icon:"🌱", minLevel:1  },
        { name:"Çırak",     icon:"🔧", minLevel:5  },
        { name:"Yetenekli", icon:"⭐", minLevel:10 },
        { name:"Uzman",     icon:"🎖️", minLevel:15 },
        { name:"Usta",      icon:"💠", minLevel:20 },
        { name:"Pro",       icon:"👑", minLevel:25 },
    ],
    /* Seviye ilerlemesi: doğrusal + üstel bileşenli, seviye arttıkça zorlaşır. */
    xpForLevel(level) {
        return Math.round(140 + (level - 1) * 75 + Math.pow(level, 1.55) * 9);
    }
};

/* ── Şifre doğrulama ── */
async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function v4rinthSifreDogrula(girilenSifre) {
    if (!girilenSifre) return false;
    const hash = await sha256Hex(girilenSifre);
    return hash === YONETICI_SIFRE_HASH;
}

/* ── Level Ekle / Ayarla (şifre korumalı) ──
   Belirli bir seviyeye ulaşmak için gereken toplam XP'yi hesaplayıp
   localStorage'daki ilerlemeye yazar. Mevcut rozet/istatistikleri
   (testsCompleted, perfectTests vb.) bozmaz, sadece totalXp'yi günceller. */
function v4rinthToplamXpHesapla(hedefSeviye) {
    let toplam = 0;
    for (let lv = 1; lv < hedefSeviye; lv++) {
        toplam += V4rinthSeviyeAyarlari.xpForLevel(lv);
    }
    return toplam;
}

async function V4rinthLevelEkle() {
    const girilen = prompt("🔒 Yönetici şifresi (level eklemek/ayarlamak için):");
    if (girilen === null) return false;

    const dogruMu = await v4rinthSifreDogrula(girilen);
    if (!dogruMu) {
        alert("❌ Yanlış şifre. İşlem iptal edildi.");
        return false;
    }

    const STORAGE_KEY = "mrvarinth_progress_v1";
    let progress;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        progress = raw ? JSON.parse(raw) : {};
    } catch (e) {
        progress = {};
    }
    progress.totalXp = progress.totalXp || 0;

    // Mevcut seviyeyi bul (gösterim amaçlı)
    let mevcutSeviye = 1, kalan = progress.totalXp, gerek = V4rinthSeviyeAyarlari.xpForLevel(mevcutSeviye);
    while (kalan >= gerek) { kalan -= gerek; mevcutSeviye++; gerek = V4rinthSeviyeAyarlari.xpForLevel(mevcutSeviye); }

    const girilenSeviye = prompt(
        "Mevcut seviye: " + mevcutSeviye + "\n\n" +
        "Hangi seviyeye ayarlamak istiyorsun? (1-30 arası bir sayı gir)"
    );
    if (girilenSeviye === null) return false;

    const hedefSeviye = parseInt(girilenSeviye, 10);
    if (!Number.isInteger(hedefSeviye) || hedefSeviye < 1 || hedefSeviye > 999) {
        alert("❌ Geçersiz seviye numarası. İşlem iptal edildi.");
        return false;
    }

    progress.totalXp = v4rinthToplamXpHesapla(hedefSeviye);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        alert("İşlem sırasında bir hata oluştu: " + e.message);
        return false;
    }

    alert("✅ Seviye " + hedefSeviye + " olarak ayarlandı. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}


async function V4rinthLevelleriSifirla() {
    const girilen = prompt("🔒 Yönetici şifresi (levelleri sıfırlamak için):");
    if (girilen === null) return false;

    const dogruMu = await v4rinthSifreDogrula(girilen);
    if (!dogruMu) {
        alert("❌ Yanlış şifre. Levelleri sıfırlama işlemi iptal edildi.");
        return false;
    }

    const onay = confirm(
        "⚠️ Bu işlem geri alınamaz!\n\n" +
        "Tüm seviye, XP, rozet ve istatistik ilerlemen SIFIRLANACAK.\n\n" +
        "Devam etmek istediğine emin misin?"
    );
    if (!onay) return false;

    try {
        localStorage.removeItem("mrvarinth_progress_v1");
    } catch (e) {
        alert("Sıfırlama sırasında bir hata oluştu: " + e.message);
        return false;
    }

    alert("✅ Tüm levelleriniz sıfırlandı. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}

if (typeof window !== "undefined") {
    window.V4rinthSeviyeAyarlari = V4rinthSeviyeAyarlari;
    window.V4rinthLevelleriSifirla = V4rinthLevelleriSifirla;
    window.V4rinthLevelEkle = V4rinthLevelEkle;
}
