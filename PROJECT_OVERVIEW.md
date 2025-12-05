# SwarmOPS Kanban Planner - Proje Dokümantasyonu

## 📋 Genel Bakış

**SwarmOPS Kanban Planner**, Microsoft Planner'dan ilham alınarak geliştirilmiş, çok kullanıcılı bir proje takip ve görev yönetim web uygulamasıdır. Supabase backend altyapısı kullanarak gerçek zamanlı işbirliği sağlar ve join code sistemi ile projelerin kolayca paylaşılmasına olanak tanır.

### Proje Amacı

- Takımların projelerini görsel Kanban board'lar üzerinden yönetmesi
- Görevlerin durumlarını (Ideas, To Do, In Progress, Done) takip etmesi
- Çok kullanıcılı işbirliği ile aynı projede eş zamanlı çalışma
- Basit ve kullanıcı dostu arayüz ile hızlı görev yönetimi

---

## ✨ Özellikler

### 1. Proje Yönetimi
- ✅ **Proje Oluşturma**: Özel isim, açıklama ve renk ile proje oluşturma
- ✅ **Proje Düzenleme**: Mevcut projeleri düzenleme ve silme
- ✅ **Join Code Sistemi**: Her proje için benzersiz 6 karakterlik paylaşım kodu
- ✅ **Proje Listesi**: Sidebar'da tüm projelerin listelenmesi
- ✅ **Proje Seçimi**: Kolay proje değiştirme

### 2. Görev Yönetimi (Tasks)
- ✅ **4 Kolonlu Kanban Board**:
  - **Ideas**: Gelecekte uygulanacak fikirler
  - **To Do**: Yapılacaklar
  - **In Progress**: Devam eden işler
  - **Done**: Tamamlanan görevler

- ✅ **Görev Özellikleri**:
  - Başlık (zorunlu)
  - Açıklama (opsiyonel, çok satırlı)
  - Durum (Ideas, To Do, In Progress, Done)
  - Bitiş tarihi (opsiyonel)
  - Öncelik seviyesi (Low, Medium, High)
  - Sıralama (order) - kolon içinde sıralama için

### 3. Drag & Drop
- ✅ **Sürükle-Bırak**: Görevleri kolonlar arasında sürükleyerek durum değiştirme
- ✅ **Otomatik Sıralama**: Görevlerin kolon içinde doğru sırada tutulması
- ✅ **Gerçek Zamanlı Güncelleme**: Drag & drop işlemi Supabase'e kaydedilir

### 4. Arama ve Filtreleme
- ✅ **Metin Arama**: Görev başlıklarında arama
- ✅ **Durum Filtresi**: Belirli durumlardaki görevleri gösterme (All, Ideas, To Do, In Progress, Done)
- ✅ **Anlık Filtreleme**: Arama ve filtreleme anında uygulanır

### 5. Çok Kullanıcılı İşbirliği
- ✅ **Join Code ile Paylaşım**: Proje sahibi join code'u paylaşır, diğerleri katılır
- ✅ **Gerçek Zamanlı Senkronizasyon**: Değişiklikler tüm kullanıcılara otomatik yansır
- ✅ **Eş Zamanlı Çalışma**: Birden fazla kullanıcı aynı projede çalışabilir
- ✅ **Otomatik Yenileme**: Her yazma işleminden sonra veriler yeniden yüklenir

### 6. Kullanıcı Arayüzü
- ✅ **Responsive Tasarım**: Desktop ve mobil cihazlarda çalışır
- ✅ **Collapsible Sidebar**: Desktop'ta sidebar'ı kapatıp açma
- ✅ **Modern UI**: Tailwind CSS ile temiz ve modern arayüz
- ✅ **Renkli Projeler**: Her proje için özel renk seçimi
- ✅ **Öncelik Göstergeleri**: Görevlerde renkli öncelik rozetleri

### 7. Join Code Yönetimi
- ✅ **Otomatik Üretim**: Her proje için benzersiz 6 karakterlik kod
- ✅ **Kopyalama**: Join code'u tek tıkla kopyalama
- ✅ **Board'da Görünürlük**: Aktif projenin join code'u board başlığında görünür
- ✅ **Büyük Harf Dönüşümü**: Kodlar otomatik olarak büyük harfe çevrilir

---

## 🛠 Teknoloji Stack'i

### Frontend
- **React 18.2.0**: UI framework
- **TypeScript 5.3.3**: Tip güvenliği
- **Vite 5.0.8**: Build tool ve dev server
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **@hello-pangea/dnd 16.3.1**: Drag & drop kütüphanesi

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL veritabanı
  - RESTful API
  - Row Level Security (RLS)
  - Anon key authentication

### Development Tools
- **PostCSS**: CSS işleme
- **Autoprefixer**: CSS vendor prefix'leri
- **TypeScript**: Tip kontrolü ve derleme

### Deployment
- **Netlify**: Web hosting ve CI/CD
- **GitHub**: Version control

---

## 🏗 Mimari Yapı

### Veri Akışı

```
User Action → React Component → usePlannerStore Hook → Supabase Client → Supabase Database
                                                              ↓
User Interface ← React State ← usePlannerStore Hook ← Supabase Response
```

### State Management

**usePlannerStore** (React Context API):
- Merkezi state yönetimi
- Supabase ile tüm CRUD işlemleri
- Proje ve görev state'leri
- Loading ve error state'leri

### Veri Persistence

- **Supabase**: Tüm proje ve görev verileri
- **localStorage**: Sadece son seçilen proje ID'si (kullanıcı deneyimi için)

---

## 📊 Veritabanı Şeması

### `projects` Tablosu

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key, otomatik oluşturulur |
| `name` | TEXT | Proje adı (zorunlu) |
| `description` | TEXT | Proje açıklaması (opsiyonel) |
| `color` | TEXT | Proje rengi (hex format, opsiyonel) |
| `join_code` | TEXT | Benzersiz 6 karakterlik paylaşım kodu (zorunlu, unique) |
| `created_at` | TIMESTAMPTZ | Oluşturulma tarihi |
| `updated_at` | TIMESTAMPTZ | Son güncelleme tarihi |

### `tasks` Tablosu

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID | Primary key, otomatik oluşturulur |
| `project_id` | UUID | Foreign key → projects.id (CASCADE delete) |
| `title` | TEXT | Görev başlığı (zorunlu) |
| `description` | TEXT | Görev açıklaması (opsiyonel) |
| `status` | TEXT | Durum: 'ideas', 'todo', 'in_progress', 'done' |
| `due_date` | DATE | Bitiş tarihi (opsiyonel) |
| `priority` | TEXT | Öncelik: 'low', 'medium', 'high' |
| `task_order` | INTEGER | Kolon içi sıralama |
| `created_at` | TIMESTAMPTZ | Oluşturulma tarihi |
| `updated_at` | TIMESTAMPTZ | Son güncelleme tarihi |

### İlişkiler

- `tasks.project_id` → `projects.id` (Foreign Key, CASCADE DELETE)
- Bir proje silindiğinde tüm görevleri otomatik silinir

### Row Level Security (RLS)

- Şu anda anonim erişim açık (tüm kullanıcılar okuyup yazabilir)
- Gelecekte kullanıcı bazlı erişim kontrolü eklenebilir

---

## 📁 Proje Yapısı

```
SwarmOPS/
├── src/
│   ├── components/
│   │   ├── board/              # Board ile ilgili bileşenler
│   │   │   ├── Board.tsx       # Ana Kanban board komponenti
│   │   │   ├── Column.tsx      # Tek bir kolon komponenti
│   │   │   ├── TaskCard.tsx    # Görev kartı komponenti
│   │   │   ├── TaskModal.tsx   # Görev düzenleme modal'ı
│   │   │   ├── TaskCreateModal.tsx  # Yeni görev oluşturma modal'ı
│   │   │   └── ProjectModal.tsx     # Proje oluşturma/düzenleme modal'ı
│   │   ├── common/             # Ortak bileşenler
│   │   │   └── ColorPicker.tsx # Renk seçici komponenti
│   │   ├── entry/              # Giriş ekranı
│   │   │   └── EntryScreen.tsx # Proje oluştur/katıl ekranı
│   │   └── layout/             # Layout bileşenleri
│   │       └── Sidebar.tsx     # Proje listesi sidebar'ı
│   ├── hooks/                  # React hooks
│   │   └── usePlannerStore.tsx # Merkezi state yönetimi hook'u
│   ├── lib/                    # Kütüphaneler
│   │   └── supabaseClient.ts   # Supabase client yapılandırması
│   ├── types/                  # TypeScript tip tanımları
│   │   └── domain.ts           # Proje ve görev tipleri
│   ├── utils/                  # Yardımcı fonksiyonlar
│   │   └── joinCode.ts         # Join code üretme fonksiyonu
│   ├── App.tsx                 # Ana uygulama komponenti
│   ├── main.tsx                # Uygulama giriş noktası
│   ├── index.css               # Global CSS stilleri
│   └── vite-env.d.ts          # Vite environment type tanımları
├── public/                     # Statik dosyalar
├── .env.local                  # Environment variables (gitignore'da)
├── netlify.toml               # Netlify deployment config
├── package.json               # Proje bağımlılıkları ve script'ler
├── tsconfig.json              # TypeScript yapılandırması
├── vite.config.ts             # Vite yapılandırması
├── tailwind.config.js         # Tailwind CSS yapılandırması
├── postcss.config.js          # PostCSS yapılandırması
├── README.md                  # Hızlı başlangıç rehberi
├── DEPLOYMENT.md              # Netlify deployment talimatları
├── SUPABASE_SETUP.md          # Supabase kurulum rehberi
├── database-update-ideas.sql  # Ideas kolonu için SQL güncellemesi
└── PROJECT_OVERVIEW.md        # Bu dosya
```

---

## 🔄 Kullanım Senaryoları

### Senaryo 1: Yeni Proje Oluşturma

1. Kullanıcı uygulamayı açar
2. Entry screen'de "Create New Project" butonuna tıklar
3. Proje adı, açıklama ve renk seçer
4. "Create" butonuna tıklar
5. Sistem benzersiz bir join code üretir (örn: `ABC123`)
6. Join code ekranda gösterilir ve kopyalanabilir
7. Kullanıcı join code'u takım üyeleriyle paylaşır
8. Board ekranı açılır, proje aktif olur

### Senaryo 2: Mevcut Projeye Katılma

1. Kullanıcı uygulamayı açar
2. Entry screen'de "Join Existing Project" bölümüne join code girer
3. "Join Project" butonuna tıklar
4. Sistem Supabase'de join code'a göre projeyi bulur
5. Proje yüklenir, board ekranı açılır
6. Kullanıcı projeyi görüntüleyebilir ve görev ekleyebilir

### Senaryo 3: Görev Oluşturma

1. Kullanıcı board'da bir kolonun altındaki "Add task" butonuna tıklar
2. TaskCreateModal açılır
3. Görev başlığı, açıklama, öncelik ve bitiş tarihi girer
4. "Create" butonuna tıklar
5. Görev Supabase'e kaydedilir
6. Board otomatik yenilenir, görev ilgili kolonda görünür

### Senaryo 4: Görev Durumu Değiştirme (Drag & Drop)

1. Kullanıcı bir görev kartını sürükler
2. Farklı bir kolona bırakır
3. Sistem görevin `status` ve `task_order` değerlerini günceller
4. Supabase'e kaydedilir
5. Board yenilenir, görev yeni kolonda görünür
6. Diğer kullanıcılar değişikliği görür

### Senaryo 5: Çok Kullanıcılı İşbirliği

1. Kullanıcı A bir görev oluşturur
2. Sistem Supabase'e kaydeder
3. Kullanıcı B'nin ekranı otomatik yenilenir (veya manuel refresh)
4. Kullanıcı B yeni görevi görür
5. Kullanıcı B görevi düzenler
6. Kullanıcı A değişikliği görür

---

## 🔐 Güvenlik ve Yapılandırma

### Supabase Credentials

**Development (Local)**:
- `.env.local` dosyasında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`
- Git'e commit edilmez (`.gitignore`'da)

**Production (Netlify)**:
- Supabase credentials kod içinde hardcoded (anon key public, güvenli)
- Kullanıcıların manuel yapılandırma yapmasına gerek yok
- Sadece join code ile projelere erişim

### Row Level Security (RLS)

- Şu anda anonim erişim açık
- Tüm kullanıcılar tüm projeleri görebilir ve düzenleyebilir
- Gelecekte kullanıcı bazlı erişim kontrolü eklenebilir

### Join Code Güvenliği

- Join code'lar 6 karakter, büyük harf ve rakam kombinasyonu
- Her proje için benzersiz
- Tahmin edilmesi zor (36^6 = 2+ milyar kombinasyon)
- Case-insensitive (otomatik büyük harfe çevrilir)

---

## 🚀 Deployment

### Netlify Deployment

1. **Netlify Hesabı**: https://www.netlify.com
2. **GitHub Bağlantısı**: Repository'yi Netlify'a bağla
3. **Otomatik Deploy**: Her push'ta otomatik deploy
4. **Build Ayarları**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### Build Process

```bash
npm run build
```

- TypeScript derleme (`tsc`)
- Vite production build
- Çıktı: `dist/` klasörü
- Optimize edilmiş, minified dosyalar

### Environment Variables (Netlify)

Gerekli değil - Supabase credentials kod içinde hardcoded.

---

## 📱 Responsive Tasarım

### Desktop (≥1024px)
- Sidebar sol tarafta (collapsible)
- Board tam genişlikte
- Toggle butonu ile sidebar açılıp kapatılabilir

### Tablet (768px - 1023px)
- Sidebar overlay olarak açılır
- Board tam genişlikte

### Mobile (<768px)
- Sidebar hamburger menü ile açılır
- Board tam genişlikte
- Touch-friendly drag & drop

---

## 🎨 UI/UX Özellikleri

### Renkler ve Tema
- **Background**: Açık gri (`bg-gray-100`)
- **Cards**: Beyaz (`bg-white`)
- **Primary**: Mavi (`bg-blue-600`)
- **Success**: Yeşil (High priority)
- **Warning**: Sarı (Medium priority)
- **Danger**: Kırmızı (Low priority)

### Animasyonlar
- Sidebar açılma/kapanma animasyonu
- Modal açılma/kapanma
- Drag & drop preview
- Hover efektleri

### Erişilebilirlik
- Keyboard navigation desteği
- Focus states
- ARIA labels (gelecekte eklenebilir)

---

## 🔧 Geliştirme

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Environment variables oluştur
# .env.local dosyası oluştur ve Supabase credentials ekle

# Development server başlat
npm run dev
```

### Script'ler

- `npm run dev`: Development server (port 5173)
- `npm run build`: Production build
- `npm run preview`: Production build'i önizle

### Kod Standartları
- TypeScript strict mode
- Functional components
- Hooks pattern
- Component-based architecture

---

## 🐛 Bilinen Sınırlamalar

1. **Gerçek Zamanlı Senkronizasyon**: Şu anda otomatik değil, manuel refresh veya yazma işlemlerinden sonra yenileme
2. **Kullanıcı Kimlik Doğrulama**: Henüz yok, anonim erişim
3. **Görev Atama**: Görevleri kullanıcılara atama özelliği yok
4. **Dosya Ekleme**: Görevlere dosya ekleme özelliği yok
5. **Yorumlar**: Görevlerde yorum yapma özelliği yok
6. **Bildirimler**: Değişiklik bildirimleri yok

---

## 🔮 Gelecek Geliştirmeler

### Kısa Vadeli
- [ ] Gerçek zamanlı senkronizasyon (Supabase Realtime)
- [ ] Kullanıcı kimlik doğrulama (Supabase Auth)
- [ ] Görev atama özelliği
- [ ] Görev yorumları

### Orta Vadeli
- [ ] Dosya ekleme (Supabase Storage)
- [ ] Bildirimler
- [ ] Proje şablonları
- [ ] Görev etiketleri

### Uzun Vadeli
- [ ] Mobil uygulama (React Native)
- [ ] Desktop uygulama (Electron - tekrar eklenebilir)
- [ ] API entegrasyonları
- [ ] Raporlama ve analitik

---

## 📚 İlgili Dosyalar

- **README.md**: Hızlı başlangıç rehberi
- **DEPLOYMENT.md**: Netlify deployment detayları
- **SUPABASE_SETUP.md**: Supabase kurulum adımları
- **database-update-ideas.sql**: Ideas kolonu için SQL script

---

## 👥 Katkıda Bulunma

Bu proje şu anda kişisel kullanım için geliştirilmiştir. Gelecekte açık kaynak olarak yayınlanabilir.

---

## 📄 Lisans

Bu proje kişisel kullanım içindir.

---

## 📞 İletişim ve Destek

Sorular ve öneriler için GitHub Issues kullanılabilir.

---

**Son Güncelleme**: 2025-12-05  
**Versiyon**: 0.1.0  
**Durum**: Aktif Geliştirme

