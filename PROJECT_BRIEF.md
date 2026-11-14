# 81 Plaka - Kalıcı Proje Hafızası

**Proje adı:** 81 Plaka  
**Hazırlanma tarihi:** 16 Ağustos 2026  
**Doğrulanabilen mevcut durum:** İlk kullanılabilir statik sürüm kaynak kodda tamamlanmıştır. Uygulama bağımlılıksız ve mobil önceliklidir; otomatik test, backend, harici API veya yapılandırılmış yayınlama servisi yoktur.

## 1. Projenin Kısa Tanımı

81 Plaka, Türkiye'nin 81 iline ait plaka kodlarını öğrenmeye ve hatırlama düzeyini ölçmeye yarayan Türkçe bir web oyunudur. Ürün iki temel deneyimi birbirinden ayırır: **Öğren** bölümü hızlı başvurulabilen bir plaka rehberi, **Yarış** bölümü ise süreli ve puanlı bir testtir. Kullanıcı herhangi bir hesap açmadan uygulamayı tarayıcıda kullanabilir; ilerleme ve en iyi skorlar aynı tarayıcıda yerel olarak saklanır.

## 2. Neden Yapıldığı ve Çözdüğü İhtiyaç

Projenin koddan ve README'den doğrulanabilen amacı, plaka kodlarını tek tek ezberlemeyi daha düzenli ve etkileşimli hale getirmektir. Düz bir tablo hızlı bakış için faydalıyken öğrenmeyi ölçmez; yalnızca quiz kullanan bir yapı da aranan bilgiye hızlı erişimi zorlaştırır. 81 Plaka bu iki ihtiyacı aynı uygulamada karşılar: kullanıcı önce şehir-plaka eşleşmelerini açık biçimde inceler, sonra dört seçenekli yarışlarla kendini sınar.

Kişisel çıkış motivasyonu, eğitim bağlamı veya içerik üretme amacı mevcut kaynaklarda açıklanmadığı için bu belgede bunlara ilişkin varsayım yapılmamıştır.

## 3. Hedef Kullanıcı

Ürün, Türkiye'nin il plaka kodlarını öğrenmek veya bilgisini tazelemek isteyen Türkçe konuşan kullanıcılara yöneliktir. Büyük dokunma alanları, tek kolonlu içerik ve metin girişi gerektirmeyen yarış akışı telefon kullanımına uygundur. Başlangıç seviyesine rehber sunarken deneyimli kullanıcıya süreli 81 İl Challenge hedefi verir.

## 4. Kullanıcı Akışı

Kullanıcı ana ekranda uygulamanın adını, öğrenilen şehir sayısını ve iki yarış türü için saklanan en iyi skorları görür. Buradan Öğren veya Yarış yolunu seçer.

Öğren bölümünde varsayılan olarak Kart görünümü açılır. Plaka kodu ile şehir adı birlikte gösterilir; cevap saklanmaz. Önceki ve Sonraki düğmeleriyle 81 il gezilir. “Şehri Tanı” seçili il hakkında kısa bilgiyi açıp kapatır. Arama Türkçe karakterleri ve baştaki sıfırı dikkate alır; `6`, `06` veya `ankara` aynı kayda ulaşabilir. Plaka Listesi bütün şehirleri tek kolon halinde sunar. Bir arama sonucuna veya satıra dokunulduğunda ilgili kart açılır.

Yarış hazırlığında kullanıcı yarış türünü ve soru yönünü seçer. Hızlı Yarış 27 soru ve 2 dakika, 81 İl Challenge ise 81 soru ve 5 dakika sürer. Soru yönü Şehir → Plaka, Plaka → Şehir veya Karışık olabilir. Yarış sırasında kalan süre, soru sırası ve canlı puan görünür; kullanıcı dört büyük seçenekten birini seçer veya “Yarıştan Çık” ile hazırlık ekranına döner.

Doğru cevap kısa geri bildirimden sonra sonraki soruya geçirir. İlk yanlışta birinci, ikinci yanlışta ikinci ipucu açılır; üçüncü yanlışta doğru cevap gösterilir ve soru puansız tamamlanır. Sonuç ekranı toplam puanı, doğru sayısını, başarı oranını, süreyi ve ipucu alınan ya da kaçırılan soruları doğru cevaplarıyla listeler. Kullanıcı aynı yarışı tekrarlayabilir, zorlandığı şehirlerin ilkinden öğrenme kartlarına geçebilir veya ana sayfaya dönebilir.

## 5. Çalışan Temel Özellikler

- 81 ilin iki haneli plaka kodu, adı, iki yarış ipucu ve kısa tanıtım bilgisi
- Kart, arama ve tam plaka listesi içeren hızlı öğrenme rehberi
- İki yarış uzunluğu ve üç soru yönü
- Her soruda dört seçenek, üç deneme ve yönüne göre anlamlı ipuçları
- İlk denemede 3, ikinci denemede 2, üçüncü denemede 1; üç yanlışta 0 puan
- Süre, soru ilerlemesi ve puanın yarış sırasında canlı gösterimi
- Sonuç özeti ve tekrar edilmesi gereken soruların doğru cevapları
- Şehir durumları ile yarış türüne özel en iyi skorların tarayıcıda saklanması
- Yarıştan kontrollü çıkış ve sonuçtan zor şehirleri çalışma akışı

## 6. Projeyi Farklı veya İlginç Yapan Yönler

En belirgin özellik, öğrenme ile sınamayı bilinçli biçimde ayırmasıdır. Öğrenme kartı bir flashcard gibi cevabı gizlemez; şehir ve plakayı birlikte göstererek rehber hızını korur. Yarıştaki ipuçları soru yönüne göre değişir. Şehir zaten soruda görünüyorsa yemek veya yer bilgisi tekrarlanmaz; bunun yerine plaka aralığı ve ilk rakam gibi kodu bulmaya yardım eden ipuçları kullanılır. Plaka sorulduğunda ise şehrin genel özellikleri devreye girer.

Görsel dil de içerikle doğrudan ilişkilidir: beyaz kartlar, mavi TR şeridi, koyu plaka yazıları ve açık gri zemin gerçek plaka çağrışımı oluşturur. Uygulama küçük kapsamına rağmen hem kısa antrenman hem de bütün veri kümesini kapsayan zor bir challenge sunar.

## 7. Önemli Ürün ve Tasarım Kararları

Ana marka “81 Plaka” olarak sadeleştirilmiştir; ana ekranda 81 sayısı ve Plaka ifadesi öne çıkar. Mobil öncelikli tek kolon düzen, büyük düğmeler ve gereksiz ikonlardan kaçınma kararı bütün ekranlarda korunur. Öğren ekranındaki eski set ve cevap gösterme yaklaşımı kaldırılmış; Kart ve Plaka Listesi görünümleri seçilmiştir. Yarışta set ayrımı yerine rastgele 27 soruluk hızlı mod ile 81 ilin tamamını kullanan challenge bırakılmıştır.

Yarışta metin alanı bulunmaz; böylece telefon klavyesi açılmaz. Yanlış seçim doğru cevabı hemen ele vermez. Öğren kartı değişirken yalnızca kart içeriğinin güncellenmesi, sayaç ve zamanlayıcı gibi sık değişen alanların hedefli biçimde yenilenmesi daha sakin bir kullanım sağlar. Ses ve titreşim uygulanmamıştır.

## 8. Bilinçli Olarak Eklenmeyen Özellikler

Mevcut üründe hesap, giriş sistemi, avatar, reklam, harita, alt gezinme çubuğu, ses, titreşim ve yarış içinde metin girişi yoktur. Backend, veri tabanı, bulut eşitleme, sosyal sıralama ve çok oyunculu yarış bulunmaz. React, Vue, CSS framework'leri, paket yöneticisi ve derleme aracı kullanılmaz. Bu sınırlar uygulamanın küçük, hızlı ve kolay taşınabilir kalmasını sağlar; karşılığında cihazlar arası ilerleme aktarımı sunulmaz.

## 9. Teknik Olarak Nasıl Çalışır

Tarayıcı önce sayfa kabuğunu ve stilleri, ardından yerel şehir verisini ve uygulama mantığını yükler. JavaScript tek bir uygulama durumu üzerinden Ana Sayfa, Öğren, Yarış Hazırlığı, Quiz ve Sonuçlar ekranlarını üretir. Kullanıcı etkileşimleri ortak tıklama ve giriş dinleyicileriyle yönlendirilir. Yarış soruları şehir verisinden karıştırılarak hazırlanır; sayaç tarayıcı zamanı üzerinden ilerler. Ekrana eklenen veri güvenli metin üretimi için kaçış işleminden geçirilir.

Kalıcı bilgiler tarayıcının `localStorage` alanında tutulur. Her şehir `unseen`, `known` veya `difficult` durumlarından birini alır. İlk denemede doğru bilinen şehir `known`, ipucuyla bilinen veya kaçırılan şehir `difficult` olur. En iyi skorlar Hızlı Yarış ve 81 İl Challenge için ayrı kaydedilir.

## 10. Gizlilik, Maliyet ve Dış Servis Kararları

Çalışan kod herhangi bir sunucuya, analiz aracına veya harici API'ye veri göndermez. Kullanıcı hesabı ve kişisel bilgi toplama akışı yoktur. İlerleme yalnızca kullanılan tarayıcının yerel depolamasındadır; tarayıcı verileri temizlenirse veya başka cihaza geçilirse kayıtlar taşınmaz. Projede ücretli servis, abonelik veya dış servis bağımlılığı yapılandırılmamıştır. Bir yayınlama hizmeti seçildiğine ya da uygulamanın canlıya alındığına dair proje içinde doğrulanabilir kayıt yoktur.

## 11. Mevcut Durum, Sınırlar ve Gelecek Yönleri

Kaynak kod sözdizimi denetiminden geçmektedir ve veri dosyasında 81 şehir için plaka, şehir, ipuçları ve bilgi alanları bulunmaktadır. Ancak projede otomatik test altyapısı, tarayıcılar arası test kaydı, erişilebilirlik denetim raporu veya yayınlama yapılandırması yoktur. Bu nedenle “tamamlanmış sürüm” ürün özelliklerinin kaynak kodda bulunmasını ifade eder; üretim ortamında doğrulanmış canlı yayın anlamına gelmez.

Mevcut sınırlar yerel kayıtların cihazlar arasında eşitlenmemesi, içerik güncellemelerinin veri dosyasından elle yapılması ve yarışların rastgele olduğu için birebir tekrarlanabilir olmamasıdır. Gelecekte düşünülebilecek yönler; otomatik davranış testleri, gerçek telefonlarda erişilebilirlik ve performans kontrolü, çevrimdışı kurulabilir uygulama desteği, isteğe bağlı ilerleme sıfırlama/dışa aktarma ve zor şehirler için daha planlı tekrar akışıdır. Bunlar mevcut sürümde uygulanmış özellikler değildir.

## Kullanıcının Eklemesi Gereken Notlar

- Projenin kişisel çıkış motivasyonu ve uzun vadeli içerik amacı nedir?
- Uygulama için seçilmiş bir yayın adresi veya hedef yayınlama ortamı var mıdır?
- İlk sürümün kabul ölçütleri ve gerçek telefonlarda yapılan kontroller nasıl kayda alınmalıdır?

Bu belge projenin kalıcı hafıza kaydıdır. Güncel teknik ayrıntılar için çalışan kod, README ve proje içindeki teknik belgeler esas alınmalıdır.
