import { z } from 'zod'

// ── Task Schemas ──
export const createTaskSchema = z.object({
    projectId: z.string().uuid('Geçersiz proje ID'),
    title: z.string().min(1, 'Başlık zorunlu').max(200, 'Başlık en fazla 200 karakter'),
    description: z.string().max(2000, 'Açıklama en fazla 2000 karakter').optional().default(''),
    columnId: z.enum(['IDEA', 'TODO', 'IN_PROGRESS', 'DONE'], { message: 'Geçersiz kolon' }),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], { message: 'Geçersiz öncelik' }),
    createdBy: z.string().min(1, 'Oluşturan kişi zorunlu'),
    startDate: z.string().optional().default(''),
    dueDate: z.string().optional().default(''),
    labels: z.string().optional().default(''),
})

export const updateTaskColumnSchema = z.object({
    taskId: z.string().uuid('Geçersiz task ID'),
    newColumnId: z.enum(['IDEA', 'TODO', 'IN_PROGRESS', 'DONE'], { message: 'Geçersiz kolon' }),
    projectId: z.string().uuid('Geçersiz proje ID'),
})

// ── Project Schemas ──
export const createProjectSchema = z.object({
    name: z.string().min(2, 'Proje adı en az 2 karakter').max(100, 'Proje adı en fazla 100 karakter'),
})

// ── Comment Schemas ──
export const createCommentSchema = z.object({
    taskId: z.string().uuid('Geçersiz task ID'),
    content: z.string().min(1, 'Yorum boş olamaz').max(2000, 'Yorum en fazla 2000 karakter'),
    authorName: z.string().min(1, 'Yazar adı zorunlu'),
    projectId: z.string().uuid('Geçersiz proje ID'),
})

// ── Auth Schemas ──
export const loginSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter'),
})

export const joinProjectSchema = z.object({
    accessCode: z.string().min(4, 'Kod en az 4 karakter').max(10, 'Kod en fazla 10 karakter'),
    name: z.string().min(2, 'İsim en az 2 karakter').max(50, 'İsim en fazla 50 karakter'),
})
