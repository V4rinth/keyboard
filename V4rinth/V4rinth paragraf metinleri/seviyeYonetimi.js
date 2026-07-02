/* ════════════════════════════════════════════════════════════════
   MrVarinth — Seviye Sistemi (Yönetici Modülü)
   --------------------------------------------------------------
   Bu dosya seviye/XP/rütbe ayarlarını barındırır.

   ════════════════════════════════════════════════════════════════ */

const YONETICI_SIFRE_HASH = "0a786f5d329684524b049bca0d190743623189c65a1606044ef99263640e95ee";

/* ── Seviye / Kilit / Rütbe ayarları (artık burada yönetiliyor) ── */
const V4rinthSeviyeAyarlari = {
    /* Zorluk açılış seviyeleri — artık RANKS ile AYNI stilde, okunaklı bir
       dizi olarak tutuluyor (isim + ikon + açılış seviyesi bir arada).
       Isınma (0) ve Harf Çalışmaları (11) dahil hepsi burada listelenir ve
       hiçbiri kalıcı olarak "her zaman açık" değildir — hepsi unlockLevel
       değerine göre açılır/kilitlenir. */
    DIFFICULTIES: [
        { id:0,  name:"Isınma",            icon:"🔥", unlockLevel:12  },
        { id:11, name:"Harf Çalışmaları",  icon:"🔤", unlockLevel:1  },
        { id:1,  name:"Kolay",             icon:"🟢", unlockLevel:8  },
        { id:2,  name:"Orta",              icon:"🟡", unlockLevel:17  },
        { id:3,  name:"Zor",               icon:"🟠", unlockLevel:23 },
        { id:4,  name:"Ultra Zor",         icon:"🔴", unlockLevel:34 },
        { id:6,  name:"Profesyonel",       icon:"🟣", unlockLevel:40 },
        { id:5,  name:"Sesli Metin",       icon:"🔊", unlockLevel:50 },
    ],
    ALWAYS_OPEN_DIFFS: [],
    /* Uygulama açıldığında/yenilendiğinde otomatik seçilecek zorluğu
       belirlerken göz ardı edilecek (yani "gerçek zorluk ilerlemesi"
       sayılmayan, giriş/özel modu niteliğindeki) zorluk id'leri.
       Buraya id eklersen o mod otomatik seçim yarışına girmez — ama
       başka HİÇBİR zorluk açık değilse (örn. çok düşük level) yine de
       bu listedeki açık olan en yüksek seviyeli mod otomatik seçilir,
       tamamen boş kalınmaz. Bu diziyi burada özgürce düzenleyebilirsin. */
    AUTO_SELECT_EXCLUDE: [0, 11],
    RANKS: [
        { name:"Acemi",            icon:"🌱", minLevel:1  },
        { name:"Çırak",            icon:"🔧", minLevel:15 },
        { name:"Kalfa",            icon:"⭐", minLevel:25 },
        { name:"Profesyonel",      icon:"🎖️", minLevel:35 },
        { name:"Kudretli Kral",    icon:"💠", minLevel:50 },
        { name:"Azimli İmparator", icon:"👑", minLevel:75 },
    ],
    /* Seviye ilerlemesi: doğrusal + üstel bileşenli, seviye arttıkça zorlaşır. */
    xpForLevel(level) {
        return Math.round(140 + (level - 1) * 75 + Math.pow(level, 1.55) * 9);
    }
};

const V4RINTH_STORAGE_KEY = "mrvarinth_progress_v1";
const V4RINTH_DIFF_UNLOCK_KEY = "mrvarinth_diff_unlock_overrides_v1";
const V4RINTH_RANK_LEVEL_KEY = "mrvarinth_rank_level_overrides_v1";

/* ── Zorluk açılış levelleri için kayıtlı (önceden ayarlanmış) override'ları
   uygula. Bu IIFE dosya yüklenir yüklenmez çalışır, böylece MrVarinth.html
   tarafında DIFFICULTIES = _seviyeKaynak.DIFFICULTIES okunup DIFF_UNLOCK_LEVEL
   türetilmeden ÖNCE değerler güncel olur (aynı dizi referansı korunur). ── */
(function v4rinthDiffUnlockOverrideUygula() {
    try {
        const raw = localStorage.getItem(V4RINTH_DIFF_UNLOCK_KEY);
        if (!raw) return;
        const overrides = JSON.parse(raw);
        if (overrides && typeof overrides === "object") {
            Object.keys(overrides).forEach(k => {
                const v = parseInt(overrides[k], 10);
                if (Number.isInteger(v) && v >= 1) {
                    const id = parseInt(k, 10);
                    const diff = V4rinthSeviyeAyarlari.DIFFICULTIES.find(d => d.id === id);
                    if (diff) diff.unlockLevel = v;
                }
            });
        }
    } catch (e) {}
})();

/* ── Şifre doğrulama (Yönetici Paneli girişinde HTML tarafından çağrılır) ── */
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

/* ── Toplam XP hesaplama yardımcı fonksiyonu ── */
function v4rinthToplamXpHesapla(hedefSeviye) {
    let toplam = 0;
    for (let lv = 1; lv < hedefSeviye; lv++) {
        toplam += V4rinthSeviyeAyarlari.xpForLevel(lv);
    }
    return toplam;
}

/* ── Sıfırlama onay sesi ──
   NOT: Buraya "Recep İvedik - onaylıyorum" gibi bir film/dizi ses klibi
   GÖMEMİYORUM — telif hakkı korumalı medya (film sesi) olduğu için bunu
   üretemem/indiremem.

   Kod şöyle çalışır:
   1) Önce aşağıdaki yerel dosyayı çalmayı DENER (sen kendi sahip
      olduğun/iznin olan bir klibi şu isimle proje klasörüne koyarsan
      otomatik onu çalar):
        V4rinth sesler/onayliyorum.mp3
   2) O dosya yoksa/yüklenemezse, tarayıcının kendi YERLEŞİK sesli okuma
      (text-to-speech) özelliğiyle "Onaylıyorum" diye SESLENDİRİR — bu
      gerçek film sesi DEĞİL, tamamen tarayıcının robotik sesi, ama en
      azından bir geri bildirim sesi duyman için otomatik devreye girer. */
function v4rinthOnaySesiCal() {
    try {
        const ses = new Audio("V4rinth sesler/onayliyorum.mp3");
        let dosyaCaldi = false;
        ses.addEventListener("playing", () => { dosyaCaldi = true; });
        ses.play()
            .then(() => {
                // Dosya gerçekten oynatılabildi mi diye kısa bir süre sonra kontrol et.
                setTimeout(() => { if (!dosyaCaldi) v4rinthTtsOnaySesi(); }, 400);
            })
            .catch(() => v4rinthTtsOnaySesi());
        ses.addEventListener("error", () => v4rinthTtsOnaySesi());
    } catch (e) {
        v4rinthTtsOnaySesi();
    }
}

function v4rinthTtsOnaySesi() {
    try {
        if (!("speechSynthesis" in window)) return;
        const utter = new SpeechSynthesisUtterance("Onaylıyorum");
        utter.lang = "tr-TR";
        utter.rate = 0.95;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    } catch (e) {}
}

/* ── Levelleri Sıfırla — ÇEKİRDEK (asıl işlem) ──
   Şifre kontrolü burada YAPILMAZ; çağıran taraf (Yönetici Paneli ya da
   V4rinthLevelleriSifirla()) şifreyi önceden doğrulamış olmalı.
   Onay artık basit Evet/Hayır yerine "ONAYLIYORUM" yazılarak veriliyor. */
function V4rinthLevelleriSifirlaCore() {
    const girilenOnay = prompt(
        "⚠️ Bu işlem geri alınamaz!\n\n" +
        "Tüm seviye, XP, rozet ve istatistik ilerlemen SIFIRLANACAK.\n\n" +
        "Onaylamak için kutuya büyük harflerle yaz:\n\nONAYLIYORUM"
    );
    if (girilenOnay === null) return false;
    if (girilenOnay.trim().toUpperCase() !== "ONAYLIYORUM") {
        alert("❌ Onay metni eşleşmedi (\"ONAYLIYORUM\" yazman gerekiyor). Sıfırlama iptal edildi.");
        return false;
    }

    v4rinthOnaySesiCal();

    try {
        localStorage.removeItem(V4RINTH_STORAGE_KEY);
    } catch (e) {
        alert("Sıfırlama sırasında bir hata oluştu: " + e.message);
        return false;
    }

    alert("✅ Tüm levelleriniz sıfırlandı. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}

/* ── Levelleri Sıfırla — STANDALONE (ana menüdeki "🔒 sıfırla" linki için) ──
   Burada şifre SORULMAZ — sadece "ONAYLIYORUM" yazarak onaylanır.
   Panel içindeki (Yönetici Paneli > Level Ekle / şifreli akış) ayrı kalır. */
function V4rinthLevelleriSifirla() {
    return V4rinthLevelleriSifirlaCore();
}

/* ── Level Ekle / Ayarla ──
   Belirli bir seviyeye ulaşmak için gereken toplam XP'yi hesaplayıp
   localStorage'daki ilerlemeye yazar. Mevcut rozet/istatistikleri
   (testsCompleted, perfectTests vb.) bozmaz, sadece totalXp'yi günceller.
   Yönetici Paneli'nde şifre zaten doğrulandıktan SONRA çağrılır. */
function V4rinthLevelEkle() {
    let progress;
    try {
        const raw = localStorage.getItem(V4RINTH_STORAGE_KEY);
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
        "Hangi seviyeye ayarlamak istiyorsun? (örn. 15)"
    );
    if (girilenSeviye === null) return false;

    const hedefSeviye = parseInt(girilenSeviye, 10);
    if (!Number.isInteger(hedefSeviye) || hedefSeviye < 1 || hedefSeviye > 999) {
        alert("❌ Geçersiz seviye numarası. İşlem iptal edildi.");
        return false;
    }

    progress.totalXp = v4rinthToplamXpHesapla(hedefSeviye);

    try {
        localStorage.setItem(V4RINTH_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        alert("İşlem sırasında bir hata oluştu: " + e.message);
        return false;
    }

    alert("✅ Seviye " + hedefSeviye + " olarak ayarlandı. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}

/* ── Zorluk Açılış Levellerini Ayarla ──
   Hangi zorluğun hangi Level'de açılacağını (DIFF_UNLOCK_LEVEL) tek tek
   sorar, localStorage'a kalıcı override olarak kaydeder ve sayfayı
   yeniler. Isınma (5) ve Harf Çalışmaları (11) dahil TÜM zorluklar
   listeye dahildir — artık hiçbiri kalıcı olarak "her zaman açık" değil,
   hepsi buradan ayarlanan seviyeye göre açılır/kilitlenir. Yönetici
   Paneli'nde şifre zaten doğrulandıktan SONRA çağrılır. */
function V4rinthZorlukLevelleriAyarla() {
    const yeniDegerler = {};
    let iptal = false;

    for (const d of V4rinthSeviyeAyarlari.DIFFICULTIES) {
        const mevcut = d.unlockLevel;
        const girilen = prompt(
            d.icon + " " + d.name + " hangi LEVEL'de açılsın?\n(Şu an: Lvl " + mevcut + ")\n\n" +
            "İptal etmek için Vazgeç'e bas.",
            mevcut
        );
        if (girilen === null) { iptal = true; break; }
        const sayi = parseInt(girilen, 10);
        if (!Number.isInteger(sayi) || sayi < 1 || sayi > 999) {
            alert("❌ Geçersiz değer (" + d.icon + " " + d.name + "). Hiçbir değişiklik kaydedilmedi.");
            return false;
        }
        yeniDegerler[d.id] = sayi;
    }

    if (iptal) {
        alert("İşlem iptal edildi, herhangi bir değişiklik kaydedilmedi.");
        return false;
    }

    V4rinthSeviyeAyarlari.DIFFICULTIES.forEach(d => { d.unlockLevel = yeniDegerler[d.id]; });

    try {
        const kaydedilecek = {};
        V4rinthSeviyeAyarlari.DIFFICULTIES.forEach(d => { kaydedilecek[d.id] = d.unlockLevel; });
        localStorage.setItem(V4RINTH_DIFF_UNLOCK_KEY, JSON.stringify(kaydedilecek));
    } catch (e) {
        alert("Kaydetme sırasında bir hata oluştu: " + e.message);
        return false;
    }

    alert("✅ Zorluk açılış levelleri güncellendi. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}

/* ── Zorluk açılış levellerini varsayılana (kodda gömülü değerlere) döndür ── */
function V4rinthZorlukLevelleriSifirla() {
    const onay = confirm("Zorluk açılış levellerini varsayılana döndürmek istiyor musun?");
    if (!onay) return false;
    try {
        localStorage.removeItem(V4RINTH_DIFF_UNLOCK_KEY);
    } catch (e) {
        alert("Hata: " + e.message);
        return false;
    }
    alert("✅ Zorluk açılış levelleri varsayılana döndürüldü. Sayfa şimdi yenilenecek.");
    location.reload();
    return true;
}

if (typeof window !== "undefined") {
    window.V4rinthSeviyeAyarlari = V4rinthSeviyeAyarlari;
    window.v4rinthSifreDogrula = v4rinthSifreDogrula;
    window.V4rinthLevelleriSifirla = V4rinthLevelleriSifirla;
    window.V4rinthLevelleriSifirlaCore = V4rinthLevelleriSifirlaCore;
    window.V4rinthLevelEkle = V4rinthLevelEkle;
    window.V4rinthZorlukLevelleriAyarla = V4rinthZorlukLevelleriAyarla;
    window.V4rinthZorlukLevelleriSifirla = V4rinthZorlukLevelleriSifirla;
}