# Netlify Deployment Talimatları

## Hızlı Başlangıç

### 1. Netlify Hesabı Oluştur
- https://www.netlify.com adresine git
- "Sign up" butonuna tıkla
- GitHub hesabınla giriş yap (önerilen)

### 2. Yeni Site Oluştur
- Netlify dashboard'da "Add new site" → "Import an existing project" seç
- "GitHub" seç
- GitHub hesabını bağla (eğer bağlı değilse)
- `Verm1lion/SwarmOPS` repository'sini seç

### 3. Build Ayarları
Netlify otomatik olarak şunları algılayacak:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18` (netlify.toml'den)

Eğer otomatik algılamazsa, manuel olarak ayarla:
- Build command: `npm run build`
- Publish directory: `dist`

### 4. Deploy
- "Deploy site" butonuna tıkla
- İlk build 2-5 dakika sürebilir
- Build tamamlandıktan sonra URL alacaksın (örn: `swarmops-xyz123.netlify.app`)

### 5. URL Paylaş
- Mac kullanıcısına Netlify URL'ini gönder
- Tarayıcıdan açıp kullanabilir
- Setup dosyası gerekmez!

## Otomatik Deploy

Her GitHub'a push yaptığında Netlify otomatik olarak:
- Yeni build yapar
- Deploy eder
- URL aynı kalır (güncellenmiş versiyon)

## Custom Domain (Opsiyonel)

1. Netlify dashboard'da "Domain settings" → "Add custom domain"
2. Domain adını gir
3. DNS ayarlarını yap (Netlify talimatları verir)

## Environment Variables (Gerekli Değil)

Supabase credentials kod içinde hardcoded olduğu için environment variable eklemen gerekmez.

## Troubleshooting

### Build Başarısız Olursa
- Netlify build loglarını kontrol et
- `npm ci` komutunu kullan (package-lock.json'dan install eder)
- Node version'ın 18 olduğundan emin ol

### Site Açılmıyorsa
- Build'in başarılı olduğundan emin ol
- `dist` klasörünün oluştuğunu kontrol et
- Browser console'da hata var mı kontrol et

## Avantajlar

- ✅ Ücretsiz
- ✅ Otomatik deploy (her push'ta)
- ✅ HTTPS otomatik
- ✅ Her platformdan erişilebilir
- ✅ Setup dosyası gerekmez
- ✅ Kolay paylaşım (sadece URL)

## Mac Kullanıcısı İçin

1. Netlify URL'ini al (örn: `swarmops-xyz123.netlify.app`)
2. Tarayıcıda aç (Chrome, Safari, Firefox - hepsi çalışır)
3. Join code'u gir
4. Projeye katıl

**Setup dosyası gerekmez!** Sadece tarayıcı yeterli.

