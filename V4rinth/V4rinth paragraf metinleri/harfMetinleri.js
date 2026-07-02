/* ════════════════════════════════════════════════════════════════
   MrVarinth — Harf Çalışmaları Veri Dosyası
   --------------------------------------------------------------
   F Klavye standart öğretim sırasına göre (MEB müfredatı) hazırlanmış
   seviyeli harf çalışması içerikleri. Her seviye bir "harf grubu"na
   karşılık gelir ve oyun motoru tarafından otomatik olarak 3 kez
   tekrar ettirilir (rep 1-3).

   KULLANIM:
   index.html dosyası bu dosyayı <script> ile yükler ve global
   `V4rinthHarfMetinleri` değişkenini okur. Eğer bu dosya bulunamazsa
   (yüklenemezse) oyun, kendi içine gömülü yedek (fallback) içerikle
   sorunsuz çalışmaya devam eder — yani bu dosyayı silmek oyunu
   bozmaz, sadece harf çalışmalarını güncellemeyi zorlaştırır.

   SEVİYE EKLEME / DÜZENLEME:
   Aşağıdaki nesneye yeni bir anahtar (örn. 11) ekleyerek yeni bir
   harf grubu seviyesi tanımlayabilirsin. `title` grup başlığı,
   `lines` ise art arda yazdırılacak satırlardır.
   ════════════════════════════════════════════════════════════════ */

const V4rinthHarfMetinleri = {
    1: {
        title: "Temel Sıra — Sol El (U İ E A)",
        lines: [
            "aaa aaa ka ak aka kak aaa kkk aaa",
            "ui ui ie ie ea ea ae ae",
            "aue aue eau eau uea uea",
            "aei aei uei uei aeu aeu",
            "iaeu iaeu ueia ueia aeiu aeiu"
        ]
    },
    2: {
        title: "Temel Sıra — Sağ El (K M L Y)",
        lines: [
            "kkk mmm lll yyy",
            "km km ml ml ly ly yk yk",
            "kly kly ylk ylk mky mky",
            "klm klm lmy lmy ymk ymk",
            "kmly kmly ylmk ylmk"
        ]
    },
    3: {
        title: "Temel Sıra — Karışık (UİEA + KMLY)",
        lines: [
            "kau kau mei mei ley ley",
            "ekam ekam ulay ulay imel imel",
            "kale kale mali mali yele yele",
            "elma elma kamu kamu lale lale",
            "amel amel kale kale yumak yumak"
        ]
    },
    4: {
        title: "T Harfi (Sağ İşaret Parmağı)",
        lines: [
            "ttt ttt tat tat tet tet",
            "tut tut tit tit tam tam",
            "kat kat mat mat at at",
            "tatlı tatlı tatlı atlat atlat",
            "tam tam katlam katlam atalet atalet"
        ]
    },
    5: {
        title: "Ü Harfi (Sol İşaret Parmağı)",
        lines: [
            "üüü üüü aüa aüa akü akü",
            "ütü ütü kül kül tüt tüt",
            "küme küme tüm tüm yükü yükü",
            "ütülü ütülü külüm külüm tütün tütün",
            "ükü ükü tüme tüme tüyü tüyü"
        ]
    },
    6: {
        title: "Üst Sıra Harfleri (O R N I)",
        lines: [
            "ooo rrr nnn ııı",
            "or or rn rn ni ni io io",
            "orman orman karın karın yorum yorum",
            "ornin ornin ronay ronay nario nario",
            "norma norma rotin rotin ironi ironi"
        ]
    },
    7: {
        title: "Alt Sıra Harfleri (S D Z C)",
        lines: [
            "sss ddd zzz ccc",
            "sd sd dz dz zc zc cs cs",
            "süzde süzde caydı caydı sezdim sezdim",
            "destan destan cazır cazır sızdı sızdı",
            "dizce dizce sazcı sazcı cüzdan cüzdan"
        ]
    },
    8: {
        title: "Kalan Harfler (B F G Ğ H J P Ş V)",
        lines: [
            "bbb fff ggg ğğğ hhh",
            "jjj ppp şşş vvv",
            "bağış bağış fişek fişek vahşi vahşi",
            "pergel pergel hijyen hijyen şahbaz şahbaz",
            "değiş değiş bağla bağla göğüs göğüs"
        ]
    },
    9: {
        title: "Karışık Kelime Çalışması",
        lines: [
            "kalem kalem defter defter sıra sıra",
            "okul okul öğretmen öğretmen sınıf sınıf",
            "klavye klavye yazılım yazılım program program",
            "hızlı hızlı doğru doğru pratik pratik",
            "başarı başarı azim azim sabır sabır"
        ]
    },
    10: {
        title: "Noktalama ve Büyük Harf (Shift)",
        lines: [
            "Ali, Ayşe ve Can okula gitti.",
            "Bugün hava çok güzel, değil mi?",
            "Türkiye'nin başkenti Ankara'dır.",
            "Klavye çalışması her gün tekrar ister!",
            "Sabır, başarının en önemli anahtarıdır."
        ]
    }
};

/* Eski kod uyumluluğu için sıralı dizi biçiminde de erişim sağlanır. */
if (typeof window !== "undefined") {
    window.V4rinthHarfMetinleri = V4rinthHarfMetinleri;
}
