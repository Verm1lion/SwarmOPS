# Build ve Dağıtım Rehberi

## Özet

Bu proje artık hem web uygulaması hem de Electron desktop app olarak çalışabilir.

## Yapılan Değişiklikler

### ✅ Faz 1: UI İyileştirmeleri

1. **Sidebar Toggle Butonu**
   - Desktop'ta sidebar'ı kapatıp açabilirsiniz
   - Toggle butonu sidebar'ın sağ tarafında
   - State localStorage'da saklanıyor
   - Sidebar kapalıyken board tam genişlikte

2. **Ideas Kolonu**
   - 4. kolon olarak "Ideas" eklendi (en solda)
   - Gelecek fikirler için kullanılabilir
   - Drag & drop destekleniyor

### ✅ Faz 2: Electron Desktop App

1. **Electron Kurulumu**
   - `electron` ve `electron-builder` paketleri eklendi
   - `electron/main.js` - Ana Electron process
   - `electron/preload.js` - Preload script (güvenlik)

2. **Windows ve Mac Build**
   - Windows: `.exe` installer
   - Mac: `.dmg` ve `.zip`
   - Build config `package.json` içinde

3. **Otomatik Supabase Yapılandırması**
   - Supabase credentials hardcoded (anon key public, güvenli)
   - Kullanıcıların manuel yapılandırma yapmasına gerek yok
   - Sadece join code ile projelere katılabilirler

### ✅ Faz 3: Database Schema

- `database-update-ideas.sql` dosyası hazır
- Supabase SQL Editor'de çalıştırılmalı

## Kullanım

### Web Uygulaması (Mevcut)

```bash
npm run dev
```

### Electron Development

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run electron:dev
```

### Production Build

**Windows:**
```bash
npm run build:win
```
Çıktı: `release/SwarmOPS Kanban Planner-0.1.0-Setup.exe`

**Mac:**
```bash
npm run build:mac
```
Çıktı: `release/SwarmOPS Kanban Planner-0.1.0.dmg`

**Her İkisi:**
```bash
npm run build:all
```

## Database Güncellemesi

Ideas kolonu için Supabase'de şu SQL'i çalıştırın:

```sql
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('ideas', 'todo', 'in_progress', 'done'));
```

Detaylar için `database-update-ideas.sql` dosyasına bakın.

## Icon Dosyaları

`electron/icons/` klasörüne icon dosyaları ekleyebilirsiniz:
- `icon.png` (512x512)
- `icon.ico` (Windows)
- `icon.icns` (Mac)

Icon yoksa Electron varsayılan icon'u kullanır.

## Notlar

- İlk build uzun sürebilir (electron-builder bağımlılıkları indirir)
- Build sırasında internet bağlantısı gereklidir
- Windows build için Visual Studio Build Tools gerekebilir
- Mac build için Xcode Command Line Tools gerekebilir

Detaylı bilgi için `ELECTRON_SETUP.md` dosyasına bakın.

