# Electron Desktop App Kurulum Rehberi

## Ön Hazırlık

### 1. Icon Dosyalarını Hazırlayın

`electron/icons/` klasörüne aşağıdaki dosyaları ekleyin:

- `icon.png` - 512x512 PNG (genel)
- `icon.ico` - Windows için (256x256 veya daha büyük)
- `icon.icns` - Mac için

**Not**: Icon dosyaları yoksa Electron varsayılan icon'u kullanacaktır. İleride ekleyebilirsiniz.

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

## Development Modu

Electron'u development modunda çalıştırmak için:

```bash
# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Electron (yeni terminal)
npm run electron:dev
```

**Not**: Windows'ta `NODE_ENV=development` çalışmayabilir. Bu durumda `electron/main.js` dosyasında `isDev` kontrolünü manuel olarak `true` yapabilirsiniz.

## Production Build

### Windows için EXE Oluşturma

```bash
npm run build:win
```

Çıktı: `release/SwarmOPS Kanban Planner-0.1.0-Setup.exe`

### Mac için APP/DMG Oluşturma

```bash
npm run build:mac
```

Çıktı: 
- `release/SwarmOPS Kanban Planner-0.1.0.dmg`
- `release/SwarmOPS Kanban Planner-0.1.0.zip`

### Her İki Platform için

```bash
npm run build:all
```

## Build Çıktıları

Tüm build dosyaları `release/` klasöründe oluşturulur.

## Supabase Yapılandırması

App içinde Supabase credentials hardcoded olarak eklenmiştir. Kullanıcıların manuel yapılandırma yapmasına gerek yoktur.

- Supabase URL: `https://nmvsqkhgmywekkqygauc.supabase.co`
- Anon Key: Otomatik olarak yüklenir

Kullanıcılar sadece join code ile projelere katılabilir.

## Database Güncellemesi

Ideas kolonu için veritabanını güncellemeyi unutmayın:

1. Supabase Dashboard → SQL Editor
2. `database-update-ideas.sql` dosyasındaki SQL'i çalıştırın

## Sorun Giderme

### "electron-builder not found" hatası

```bash
npm install --save-dev electron-builder
```

### Windows'ta build hatası

- Visual Studio Build Tools yüklü olmalı
- veya `npm install --global windows-build-tools`

### Mac'te build hatası

- Xcode Command Line Tools yüklü olmalı
- `xcode-select --install`

## Dağıtım

### Windows

`.exe` dosyasını kullanıcılara dağıtın. Installer otomatik olarak:
- Desktop shortcut oluşturur
- Start Menu'ye ekler
- Program Files'e yükler

### Mac

`.dmg` dosyasını kullanıcılara dağıtın. Kullanıcılar:
1. DMG'yi açarlar
2. App'i Applications klasörüne sürüklerler
3. İlk açılışta güvenlik uyarısı alabilirler (System Preferences → Security)

## Notlar

- İlk build uzun sürebilir (electron-builder tüm bağımlılıkları indirir)
- Build sırasında internet bağlantısı gereklidir
- Icon dosyaları opsiyoneldir, sonradan eklenebilir

