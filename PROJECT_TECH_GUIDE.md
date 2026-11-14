# 81 Plaka - Teknik Rehber

## 1. Projeyi Anlatabilme Özeti

Bu projeyi HTML5, CSS3 ve tarayıcıda çalışan saf JavaScript ile yaptık. React veya başka bir framework kullanmadık. 81 ilin plaka, şehir, yarış ipucu ve kısa bilgi verileri bir API'den gelmiyor; proje içindeki yerel bir JavaScript veri dosyasından okunuyor. Ekranlar JavaScript tarafından tek sayfa içinde değiştiriliyor, yarış hesapları kullanıcının cihazında yapılıyor ve ilerleme `localStorage` ile aynı tarayıcıda saklanıyor. Backend, harici veri tabanı ve projeye bağlanmış bir yayınlama servisi yok.

## 2. Kullanılan Teknolojiler

### HTML5

- **Türü:** İşaretleme dili
- **Projede ne işe yarıyor:** Sayfanın temel kabuğunu, mobil görünüm ayarlarını, uygulamanın yerleşeceği ana alanı ve JavaScript kapalıyken gösterilen uyarıyı tanımlar. Stil ve uygulama dosyalarını yükler.
- **Neden tercih edildi:** Tarayıcıların doğrudan anladığı standart yapıdır; ek çalışma ortamı veya derleme gerektirmez.

### CSS3

- **Türü:** Stil dili
- **Projede ne işe yarıyor:** Açık renkli plaka temasını, kartları, düğmeleri, durum renklerini ve telefon genişliklerine uyumlu yerleşimi oluşturur. Tasarım renkleri CSS değişkenlerinde merkezi biçimde tutulur.
- **Neden tercih edildi:** Küçük bir uygulamanın bütün görsel ihtiyaçlarını harici bir arayüz kütüphanesi olmadan karşılar ve çıktı boyutunu düşük tutar.

### Vanilla JavaScript

- **Türü:** Programlama dili
- **Projede ne işe yarıyor:** Uygulama durumunu yönetir, beş ekranı üretir, aramayı çalıştırır, yarış sorularını hazırlar, seçenekleri değerlendirir, zaman ve puanı hesaplar, sonuçları gösterir.
- **Neden tercih edildi:** Uygulamanın kapsamı framework gerektirmeyecek kadar küçüktür. Tarayıcıda doğrudan çalıştığı için paket kurma ve derleme adımı oluşmaz.

### JavaScript Nesne ve Dizi Yapısı

- **Türü:** Veri formatı ve yerel veri kaynağı
- **Projede ne işe yarıyor:** 81 şehir kaydını `plate`, `city`, `hints` ve `info` alanlarıyla belleğe verir. Uygulamanın öğrenme kartları, arama sonuçları ve yarış soruları aynı veri kümesini kullanır.
- **Neden tercih edildi:** Veri küçük ve sabittir; ayrı bir dosyada tutulması içeriği uygulama mantığından ayırırken ağ isteğini gereksiz kılar.

### Web Storage (`localStorage`)

- **Türü:** Tarayıcı depolama API'si
- **Projede ne işe yarıyor:** Şehirlerin öğrenme durumlarını ve iki yarış türünün en iyi skorlarını tarayıcıda kalıcı tutar.
- **Neden tercih edildi:** Hesap veya sunucu kurmadan küçük miktarda ilerleme verisini oturumlar arasında saklar. Bir veri tabanı değildir ve kayıtları başka cihaza kendiliğinden taşımaz.

### Statik Dosya Çalıştırma Yaklaşımı

- **Türü:** Yayınlama yaklaşımı; yapılandırılmış bir yayınlama servisi değildir
- **Projede ne işe yarıyor:** HTML, CSS ve JavaScript dosyaları doğrudan tarayıcı tarafından açılabilir veya herhangi bir statik dosya sunucusunda servis edilebilir.
- **Neden tercih edildi:** Sunucu tarafı işlem gerektirmeyen uygulamayı kolay taşınabilir tutar. Proje içinde gerçekten kullanıldığı doğrulanan belirli bir hosting servisi yoktur.

Projede framework, üçüncü taraf kütüphane, paket bağımlılığı, harici API veya veri tabanı bulunmamaktadır.

## 3. Sistemin Parçaları

### Arayüz

HTML dosyası yalnızca başlangıç kabuğunu sağlar. Görülen Ana Sayfa, Öğren, Yarış Hazırlığı, Quiz ve Sonuçlar ekranlarının içeriğini JavaScript üretir. CSS, bu içeriği en fazla telefon odaklı dar bir uygulama alanında, plaka kartı görünümü ve erişilebilir büyüklükte düğmelerle biçimlendirir.

### Veri Kaynağı

Şehir verileri yerel veri dosyasında tek bir liste olarak bulunur. Plaka kodları baştaki sıfırları korumak için metin olarak saklanır. Her kayıtta öğrenme ekranındaki kısa şehir bilgisi ile yarışın Plaka → Şehir yönünde kullandığı iki ayrı ipucu yer alır.

### Veri İşleme ve Uygulama Mantığı

Uygulamanın geçerli ekranı, öğrenme seçimi, yarış ayarları, aktif sorular ve sonuçlar bellekteki ortak durum nesnesinde tutulur. Görüntüleme fonksiyonları bu durumu HTML'e dönüştürür. Arama metni Türkçe harf farklarını azaltacak biçimde normalleştirilir. Yarış havuzu karıştırılır; her soru için doğru cevaba üç yanlış seçenek eklenir.

### Depolama

Yerel depolamada şehir durumları ile en iyi skorlar tek bir uygulama anahtarı altında JSON biçiminde saklanır. Kod eski tekil en iyi skor alanını okuyabilecek bir uyumluluk davranışı da içerir. Depolama okunamaz veya bozuksa uygulama boş başlangıç verisine döner.

### Backend ve Yayınlama

Backend yoktur; puanlama, zamanlama, arama ve kayıt tamamen tarayıcıda gerçekleşir. Canlı ortama ait alan adı, dağıtım komutu veya hosting yapılandırması bulunmamaktadır. Projenin statik yapısı yayınlanmaya uygundur, fakat bu uygunluk yayınlanmış olduğu anlamına gelmez.

### Test ve Yapılandırma

Projede otomatik test dosyaları, test framework'ü, paket manifestosu, derleyici veya CI yapılandırması bulunmaz. Kaynakların sözdizimi standart JavaScript denetimiyle kontrol edilebilir; kullanıcı akışlarının güvenceye alınması şu an elle tarayıcı kontrolüne bağlıdır.

## 4. Veri Akışı

1. Tarayıcı ana HTML dosyasını açar; CSS yüklenir, ardından şehir verisi ve uygulama mantığı ertelenmiş betikler olarak çalışır.
2. Uygulama şehir listesini alır, aynı tarayıcıdaki önceki ilerlemeyi `localStorage` üzerinden okumayı dener ve başlangıç durumunu kurar.
3. Ana ekran bu durumdan öğrenilen şehir sayısını ve en iyi skorları üretir.
4. Kullanıcı Öğren'i seçerse kart, arama veya liste etkileşimi şehir listesindeki bir indeksi seçer. Seçilen kaydın plaka, şehir ve isteğe bağlı kısa bilgisi doğrudan ekranda gösterilir.
5. Kullanıcı Yarış'ı seçerse yarış uzunluğu ve soru yönü bellekte tutulur. Başlatma anında şehirler karıştırılır, gerekli sayıda kayıt seçilir ve dört seçenekli sorular hazırlanır.
6. Her cevapta deneme sayısı, ipucu, puan ve şehir durumu güncellenir. Zamanlayıcı kalan süreyi tarayıcı saatine göre yeniler. Süre dolduğunda veya sorular bittiğinde yarış kapanır.
7. Sonuç verileri ekrana dönüştürülür; zorlanılan sorular ayrılır ve en iyi skor gerekirse yerel depolamaya yazılır. Sayfa daha sonra yeniden açıldığında bu yerel kayıt tekrar okunur.

## 5. Önemli Teknik Kararlar

**Bağımlılıksız statik mimari:** Kurulum gerektirmez, küçük ve kolay taşınır. Buna karşılık büyük ölçekli bileşen sistemi, hazır yönlendirme veya test araçları sunmaz.

**Tek sayfa ve istemci tarafı durum:** Ekran geçişleri yeni sayfa yüklemeden yapılır. Kod basit kalır; ancak tarayıcının geri düğmesine bağlı ayrı URL'ler veya paylaşılabilir ekran adresleri yoktur.

**Yerel ve ortak veri kümesi:** Öğrenme ile yarış aynı 81 şehir kaydını kullanır, bu yüzden iki bölümün cevapları birbirinden kopmaz. İçerik değişiklikleri için veri dosyasının güncellenmesi gerekir; uzaktan içerik yönetimi yoktur.

**Yerel depolama:** Gizlilik ve maliyet açısından sunucu ihtiyacını ortadan kaldırır. Bedeli, ilerlemenin yalnızca ilgili tarayıcı profilinde yaşaması ve kullanıcı verileri temizlendiğinde kaybolabilmesidir.

**Yöne duyarlı ipucu sistemi:** Şehir → Plaka sorusunda kullanıcı şehri zaten gördüğü için plaka aralığına ilişkin yardım verilir; Plaka → Şehir sorusunda şehir özellikleri kullanılır. Bu karar ipucunun cevabı anlamsız biçimde tekrar etmesini önler.

**Hedefli ekran güncellemeleri:** Genel ekranlar gerektiğinde yeniden üretilirken öğrenme kartı, arama sonuçları ve yarış sayaçları gibi sık değişen alanlar yerinde güncellenir. Bu yaklaşım gereksiz görsel sıçramayı azaltır; yine de uygulama tam bir bileşen sistemi kullanmadığı için bu optimizasyonlar elle yönetilir.

## 6. Bilmem Gereken Temel Kavramlar

- **Statik web uygulaması:** Sunucuda dinamik sayfa üretmeden HTML, CSS ve JavaScript dosyalarıyla çalışan uygulamadır.
- **SPA (tek sayfa uygulaması):** Kullanıcı farklı ekranlar görse de tarayıcı yeni HTML sayfalarına gitmez; mevcut sayfanın içeriği değiştirilir.
- **DOM:** Tarayıcının ekrandaki HTML öğelerini temsil ettiği yapıdır. JavaScript metinleri, düğmeleri ve ekranları bu yapı üzerinden günceller.
- **İstemci tarafı durum:** Hangi ekranın açık olduğu, seçili şehir ve mevcut puan gibi geçici bilgilerin kullanıcının tarayıcı belleğinde tutulmasıdır.
- **Veriye dayalı arayüz:** Kartların ve soruların ayrı ayrı elle yazılması yerine aynı şehir listesinden üretilmesidir.
- **Olay yönlendirme:** Tıklamaların tek bir üst alanda dinlenip düğmenin işaretine göre doğru işleve gönderilmesidir.
- **`localStorage`:** Küçük metin verilerini aynı tarayıcıda oturumlar arasında saklayan API'dir; bulut hesabı veya veritabanı değildir.
- **JSON:** JavaScript verisinin metin olarak saklanmasına yarayan biçimdir. Yerel ilerleme kaydedilirken ve okunurken kullanılır.
- **Mobil öncelikli tasarım:** Arayüzün önce dar telefon ekranları için tasarlanıp daha geniş ekranlarda uyarlanmasıdır.
- **Rastgele karıştırma:** Yarış kayıtlarının ve seçeneklerin her başlangıçta farklı sıraya getirilmesidir; bu nedenle iki yarış birebir aynı olmayabilir.

## 7. Beş Kontrol Sorusu

### 1. Şehir verileri nereden geliyor?

Bir API'den değil, proje içindeki yerel JavaScript veri listesinden geliyor. Aynı liste hem öğrenme hem yarış için kullanılıyor.

### 2. Puan ve ilerleme bir sunucuya gönderiliyor mu?

Hayır. Mevcut kodda ağ isteği veya backend yok; şehir durumları ve en iyi skorlar aynı tarayıcıdaki `localStorage` alanına yazılıyor.

### 3. Uygulamada beş ekran varken neden tek sayfa uygulaması deniyor?

Çünkü bu ekranlar ayrı HTML sayfaları değildir. JavaScript, tek sayfanın ana uygulama alanına geçerli ekranın içeriğini yerleştirir.

### 4. Öğren ile Yarış arasındaki temel teknik ve ürün farkı nedir?

Öğren bölümü veriyi doğrudan gösteren bir rehberdir. Yarış bölümü aynı veriden rastgele sorular ve seçenekler üretir; süre, deneme, ipucu ve puan durumunu yönetir.

### 5. Proje yayınlanmış ve otomatik testlerle güvence altına alınmış mı?

Proje içinde belirli bir yayınlama servisi veya canlı adres doğrulanamıyor. Otomatik test altyapısı da yok; mevcut kaynakların tarayıcı akışları elle kontrol edilmelidir.
