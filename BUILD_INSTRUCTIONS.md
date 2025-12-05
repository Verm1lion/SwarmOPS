# Build Talimatları

## Windows Setup Dosyası (.exe Installer)

### Gereksinimler
- Node.js ve npm yüklü olmalı
- PowerShell yönetici yetkisiyle çalıştırılmalı

### Adımlar

1. **PowerShell'i Yönetici Olarak Aç**
   - Başlat menüsünde "PowerShell" ara
   - "Windows PowerShell" üzerine sağ tıkla
   - "Yönetici olarak çalıştır" seç

2. **Proje Klasörüne Git**
   ```powershell
   cd C:\Users\MSI\Desktop\SwarmOPS
   ```

3. **Build Komutunu Çalıştır**
   ```powershell
   npm run build:win
   ```

4. **Setup Dosyasını Bul**
   - Build tamamlandıktan sonra `release` klasöründe:
   - `SwarmOPS Kanban Planner-0.1.0-Setup.exe` dosyası oluşacak
   - Bu dosyayı paylaşabilirsin - kullanıcılar çift tıklayarak yükleyebilir

### Notlar
- İlk build uzun sürebilir (Electron ve bağımlılıklar indirilir)
- Build sırasında internet bağlantısı gereklidir
- Setup dosyası yaklaşık 150-200 MB olacak

---

## Mac (.dmg ve .zip)

### ⚠️ ÖNEMLİ: Windows'ta Mac Build Oluşturulamaz

Mac build'i oluşturmak için **macOS gereklidir**. Windows'ta Mac build'i oluşturamazsın.

### Çözüm: GitHub Actions (Önerilen) ⭐

**Windows'tan Mac build'i oluşturmanın en kolay yolu GitHub Actions kullanmak.**

Detaylı talimatlar için `MAC_BUILD_ALTERNATIVES.md` dosyasına bak.

#### Hızlı Adımlar:

1. **GitHub Repository Oluştur ve Push Et**
   ```bash
   git init
   git add .
   git commit -m "Add Electron app"
   git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
   git push -u origin main
   ```

2. **GitHub'da Workflow Çalıştır**
   - GitHub'da repository'ye git
   - "Actions" sekmesine tıkla
   - "Build Electron App" workflow'unu seç
   - "Run workflow" butonuna tıkla

3. **Build Dosyalarını İndir**
   - Build tamamlandıktan sonra "Artifacts" bölümünden indir
   - Hem Windows hem Mac build'leri hazır olacak

### Alternatif: Mac Bilgisayarda Build

Eğer bir Mac bilgisayarın varsa:

1. **Terminal'i Aç**
   - Spotlight'da "Terminal" ara (Cmd + Space)
   - Veya Applications > Utilities > Terminal

2. **Proje Klasörüne Git**
   ```bash
   cd /path/to/SwarmOPS
   ```

3. **Build Komutunu Çalıştır**
   ```bash
   npm run build:mac
   ```

4. **Çıktı Dosyalarını Bul**
   - Build tamamlandıktan sonra `release` klasöründe:
   - `SwarmOPS Kanban Planner-0.1.0.dmg` - Disk image (installer)
   - `SwarmOPS Kanban Planner-0.1.0-mac.zip` - Zip arşivi
   - Her ikisini de paylaşabilirsin

### DMG Kullanımı
- `.dmg` dosyasını çift tıklayarak aç
- Uygulamayı Applications klasörüne sürükle
- DMG'yi kapat

### Zip Kullanımı
- `.zip` dosyasını aç
- İçindeki `.app` dosyasını Applications klasörüne sürükle

### Notlar
- İlk build uzun sürebilir
- Build sırasında internet bağlantısı gereklidir
- Mac'te code signing uyarısı çıkabilir (normal)

---

## Her İki Platform İçin

### Tek Komutla Her İkisini Build Et
```bash
npm run build:all
```

Bu komut hem Windows hem Mac build'lerini oluşturur (Mac'te çalıştırırsan).

---

## Troubleshooting

### Windows: "Cannot create symbolic link" Hatası
- PowerShell'i yönetici olarak çalıştırdığından emin ol
- Alternatif: `release/win-unpacked` klasöründeki `.exe` dosyasını kullan (installer değil)

### Mac: Code Signing Uyarısı
- Normal bir durum, uygulama çalışır
- İlk açılışta "Güvenilmeyen geliştirici" uyarısı çıkabilir
- System Preferences > Security & Privacy > "Open Anyway" tıkla

### Build Başarısız Olursa
- `node_modules` klasörünü sil ve `npm install` çalıştır
- `release` klasörünü sil ve tekrar build yap
- Terminal/PowerShell çıktısındaki hata mesajlarını kontrol et

---

## Dağıtım

### Windows
- `SwarmOPS Kanban Planner-0.1.0-Setup.exe` dosyasını paylaş
- Kullanıcılar çift tıklayarak yükleyebilir
- Desktop shortcut ve Start Menu shortcut otomatik oluşturulur

### Mac
- `.dmg` dosyasını paylaş (önerilen)
- Veya `.zip` dosyasını paylaş
- Kullanıcılar uygulamayı Applications klasörüne sürükleyebilir

### Not
- Her iki platformda da Supabase credentials hardcoded, kullanıcıların yapılandırma yapmasına gerek yok
- Sadece join code ile projelere katılabilirler

