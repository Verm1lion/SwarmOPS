# Mac Build Alternatifleri

## Sorun
Mac build'i (`.dmg` veya `.zip`) Windows'ta oluşturamazsın. Electron-builder Mac build'i için macOS gerektirir.

## Çözüm Seçenekleri

### 1. GitHub Actions ile Otomatik Build (Önerilen) ⭐

GitHub Actions kullanarak hem Windows hem Mac build'lerini otomatik oluşturabilirsin.

#### Adımlar:

1. **GitHub Repository Oluştur**
   - GitHub'da yeni bir repository oluştur
   - Projeyi push et:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
     git push -u origin main
     ```

2. **GitHub Actions Workflow**
   - `.github/workflows/build.yml` dosyası zaten oluşturuldu
   - Bu dosya otomatik olarak Windows ve Mac build'lerini oluşturur

3. **Build'i Tetikle**
   - GitHub'da "Actions" sekmesine git
   - "Build Electron App" workflow'unu seç
   - "Run workflow" butonuna tıkla
   - Veya bir tag oluştur: `git tag v1.0.0 && git push --tags`

4. **Build Dosyalarını İndir**
   - Actions tamamlandıktan sonra "Artifacts" bölümünden indir
   - Windows: `windows-setup` artifact'ından `.exe` dosyasını al
   - Mac: `mac-build` artifact'ından `.dmg` ve `.zip` dosyalarını al

#### Avantajlar:
- ✅ Ücretsiz (public repo için)
- ✅ Her iki platform için otomatik build
- ✅ Her değişiklikten sonra otomatik build
- ✅ Windows'tan Mac build oluşturabilirsin

---

### 2. Mac Bilgisayar Kullan (Eğer Varsa)

Eğer bir Mac bilgisayarın varsa:

1. **Projeyi Mac'e Kopyala**
   ```bash
   # Terminal'de
   cd /path/to/project
   npm install
   ```

2. **Build Yap**
   ```bash
   npm run build:mac
   ```

3. **Dosyaları Bul**
   - `release/` klasöründe `.dmg` ve `.zip` dosyaları olacak
   - Bunları Windows'a aktar

---

### 3. Mac Build'i Atla (Geçici Çözüm)

Eğer Mac build'e şimdilik ihtiyacın yoksa:

1. **Sadece Windows Build'i Paylaş**
   - `release/SwarmOPS Kanban Planner-0.1.0-Setup.exe` dosyasını paylaş
   - Mac kullanıcıları için web versiyonunu kullanabilirler:
     ```bash
     npm run build:web
     ```
   - `dist/` klasörünü bir web sunucusuna yükle
   - Mac kullanıcıları tarayıcıdan kullanabilir

---

### 4. Cloud Mac Servisleri (Ücretli)

- **MacStadium** - Bulut Mac kiralama
- **MacinCloud** - Bulut Mac kiralama
- **GitHub Actions** - Ücretsiz (önerilen)

---

## Hızlı Başlangıç: GitHub Actions

### 1. Repository Oluştur ve Push Et
```bash
git init
git add .
git commit -m "Add Electron app"
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

### 2. GitHub'da Workflow'u Çalıştır
- Repository'de "Actions" sekmesine git
- "Build Electron App" workflow'unu seç
- "Run workflow" butonuna tıkla

### 3. Build Tamamlandıktan Sonra
- "Artifacts" bölümünden dosyaları indir
- Windows `.exe` ve Mac `.dmg` dosyalarını al

---

## Notlar

- GitHub Actions public repo'lar için ücretsiz
- Private repo'lar için aylık 2000 dakika ücretsiz
- Build süresi: ~5-10 dakika
- Her iki platform için build otomatik oluşturulur

---

## Önerilen Yol

**GitHub Actions kullan** - En kolay ve ücretsiz yöntem. Windows'tan Mac build'i oluşturabilirsin.

