# Supabase Kurulum Rehberi (Türkçe)

## Önemli: Veritabanı Tablolarını Oluşturun

Proje oluştururken hata alıyorsanız, muhtemelen Supabase'de veritabanı tabloları henüz oluşturulmamıştır.

## Adım 1: Supabase Dashboard'a Giriş

1. [supabase.com](https://supabase.com) adresine gidin
2. Projenize giriş yapın
3. Dashboard'u açın

## Adım 2: SQL Editor'ü Açın

1. Sol menüden **SQL Editor** seçeneğine tıklayın
2. **New query** butonuna tıklayın

## Adım 3: SQL Komutlarını Çalıştırın

Aşağıdaki SQL kodunu kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın:

```sql
-- Projects tablosu
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  join_code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks tablosu
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  due_date date,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  task_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row Level Security'i etkinleştir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Eğer politikalar zaten varsa, önce sil
DROP POLICY IF EXISTS "Allow anonymous access to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous access to tasks" ON tasks;

-- Anonim erişim politikaları (Phase 1 için)
CREATE POLICY "Allow anonymous access to projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to tasks" ON tasks
  FOR ALL USING (true);
```

## Adım 4: Tabloları Kontrol Edin

1. Sol menüden **Table Editor** seçeneğine tıklayın
2. `projects` ve `tasks` tablolarının göründüğünü doğrulayın

## Adım 5: Uygulamayı Test Edin

1. Tarayıcınızda uygulamayı yenileyin
2. "Create New Project" butonuna tıklayın
3. Artık proje oluşturabilmelisiniz!

## Hata Mesajları ve Çözümleri

### "Veritabanı tablosu bulunamadı"
- **Çözüm**: Yukarıdaki SQL komutlarını çalıştırın

### "Yetki hatası" veya "RLS policy" hatası
- **Çözüm**: SQL komutlarındaki `CREATE POLICY` komutlarını çalıştırın

### "Failed to generate unique join code"
- **Çözüm**: Bu normal bir durum, tekrar deneyin

## Bağlantı Kontrolü

Eğer hala sorun yaşıyorsanız:

1. `.env.local` dosyasının doğru olduğundan emin olun
2. Supabase Dashboard → Settings → API'den URL ve anon key'i kontrol edin
3. Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin

