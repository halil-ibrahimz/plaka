# 81 Plaka

81 Plaka, Türkiye'nin 81 il plaka kodunu öğrenmek için hazırlanmış hafif ve mobil öncelikli bir tek sayfa web uygulamasıdır.

## Özellikler

- Kartlarla öğrenme ekranı
- Plaka ve şehir bilgisini aynı anda gösteren hızlı öğrenme kartı
- Plaka veya şehir adına göre arama
- 01'den 81'e kadar tam plaka listesi
- 27 soruluk hızlı yarış ve 81 soruluk challenge modu
- Yarış sırasında canlı puan göstergesi
- Dört seçenekli cevap sistemi
- Soru yönüne göre değişen iki aşamalı yarış ipuçları
- İlk denemeye göre azalan puanlama
- Sonuç ekranında puan, doğru sayısı, başarı oranı, süre ve doğru cevaplı tekrar listesi
- Hızlı Yarış ve 81 İl Challenge için ayrı en iyi skor kaydı
- Tarayıcıda yerel ilerleme kaydı

## Dosyalar

- `index.html`: Uygulama kabuğu
- `style.css`: Mobil öncelikli görsel tasarım
- `data.js`: 81 il, plaka kodları, yarış ipuçları ve kısa şehir bilgileri
- `app.js`: Ekranlar, plaka rehberi, arama, yarış mantığı, puanlama ve kayıt işlemleri
- `README.md`: Proje açıklaması

## Kullanım

Dosyaları aynı klasörde tutup `index.html` dosyasını tarayıcıda açman yeterlidir. Sunucu, derleme aracı veya ek paket gerekmez.

## Puanlama

- İlk denemede doğru: 3 puan
- İkinci denemede doğru: 2 puan
- Üçüncü denemede doğru: 1 puan
- Üç yanlış deneme: 0 puan

## Kayıt

Uygulama ilerlemeyi tarayıcının yerel depolama alanında saklar. Şehirler `görülmedi`, `öğrenildi` veya `zor` durumlarından biriyle izlenir; Hızlı Yarış ve 81 İl Challenge en iyi skorları ayrı tutulur.
