'use client'

import { useState, useRef, useEffect, startTransition } from 'react'
import { createPortal } from 'react-dom'
import { createComment, getComments } from '@/app/actions/comment'
import { uploadFile, addTaskAttachment, updateTask } from '@/app/actions/task'
import { v4 as uuidv4 } from 'uuid'
import { Task } from './TaskCard'
import { toast } from 'sonner'

interface TaskDetailsDialogProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    projectId: string
    currentUser: string
    onTaskUpdate?: (updatedTask: Task) => void
}

interface Comment {
    id: string
    content: string
    author_name: string
    created_at: string
}

export function TaskDetailsDialog({ task, isOpen, onClose, projectId, currentUser, onTaskUpdate }: TaskDetailsDialogProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [sendingComment, setSendingComment] = useState(false)
    const [uploading, setUploading] = useState(false)
    const commentEndRef = useRef<HTMLDivElement>(null)

    // Edit state
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editPriority, setEditPriority] = useState('')
    const [editStartDate, setEditStartDate] = useState('')
    const [editDueDate, setEditDueDate] = useState('')
    const [editLabels, setEditLabels] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen && task) {
            fetchComments()
            // Reset edit state when dialog opens
            setIsEditing(false)
            setEditTitle(task.title)
            setEditDescription(task.description || '')
            setEditPriority(task.priority)
            setEditStartDate(task.start_date || '')
            setEditDueDate(task.due_date || '')
            setEditLabels(task.labels?.join(', ') || '')
        } else {
            setComments([])
        }
    }, [isOpen, task])

    useEffect(() => {
        commentEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

    async function fetchComments() {
        if (!task) return
        setLoadingComments(true)
        const data = await getComments(task.id)
        // @ts-ignore
        setComments(data || [])
        setLoadingComments(false)
    }

    async function handleSendComment(e: React.FormEvent) {
        e.preventDefault()
        if (!task || !newComment.trim()) return

        setSendingComment(true)
        startTransition(async () => {
            const result = await createComment(task.id, newComment, currentUser, projectId)

            if (result?.success) {
                setNewComment('')
                fetchComments()
                toast.success('Yorum gönderildi')
            } else {
                toast.error('Yorum gönderilemedi')
            }
            setSendingComment(false)
        })
    }

    async function handleSaveEdit() {
        if (!task) return
        setSaving(true)

        const updates: Record<string, any> = {}
        if (editTitle !== task.title) updates.title = editTitle
        if (editDescription !== (task.description || '')) updates.description = editDescription
        if (editPriority !== task.priority) updates.priority = editPriority
        if (editStartDate !== (task.start_date || '')) updates.start_date = editStartDate || null
        if (editDueDate !== (task.due_date || '')) updates.due_date = editDueDate || null

        const newLabels = editLabels.split(',').map(l => l.trim()).filter(Boolean)
        const oldLabels = task.labels || []
        if (JSON.stringify(newLabels) !== JSON.stringify(oldLabels)) updates.labels = newLabels

        if (Object.keys(updates).length === 0) {
            setIsEditing(false)
            setSaving(false)
            return
        }

        startTransition(async () => {
            const result = await updateTask(task.id, updates, projectId)
            if (result?.success) {
                toast.success('Task güncellendi')
                setIsEditing(false)
                // Update local state
                if (onTaskUpdate) {
                    onTaskUpdate({ ...task, ...updates, labels: editLabels.split(',').map(l => l.trim()).filter(Boolean) })
                }
            } else {
                toast.error('Güncelleme başarısız: ' + (result?.error || ''))
            }
            setSaving(false)
        })
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !task) return

        const files = Array.from(e.target.files)
        setUploading(true)

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${uuidv4()}.${fileExt}`
                const filePath = `${projectId}/${fileName}`

                const uploadFormData = new FormData()
                uploadFormData.append('file', file)
                uploadFormData.append('path', filePath)

                const uploadResult = await uploadFile(uploadFormData)

                if (uploadResult.error || !uploadResult.url) {
                    toast.error('Dosya yüklenemedi: ' + file.name)
                    continue
                }

                startTransition(async () => {
                    const attachResult = await addTaskAttachment(task.id, uploadResult.url, task.media_urls || [], projectId)

                    if (attachResult.error) {
                        toast.error('Dosya eklenemedi')
                    } else {
                        toast.success('Dosya eklendi')
                        window.location.reload()
                    }
                })
            }
        } catch (error) {
            toast.error('Beklenmedik bir hata oluştu')
        } finally {
            setUploading(false)
        }
    }

    if (!isOpen || !task) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5">
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-gray-200 bg-gray-50 outline-none focus:border-indigo-400"
                            >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                            </select>
                        ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                        'bg-blue-50 text-blue-600'}`}>
                                {task.priority || 'LOW'}
                            </span>
                        )}
                        <span className="text-gray-400 text-sm">in {task.column_id}</span>
                        {task.completed_at && (
                            <span suppressHydrationWarning className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                {new Date(task.completed_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Düzenle
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
                                >
                                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content (Left) */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
                        {/* Title */}
                        {isEditing ? (
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full text-xl font-bold text-gray-900 mb-4 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white outline-none transition-all"
                            />
                        ) : (
                            <h1 className="text-xl font-bold text-gray-900 mb-4">{task.title}</h1>
                        )}

                        {/* Dates */}
                        <div className="mb-6 grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start Date</h3>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="w-full text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none transition-all"
                                    />
                                ) : (
                                    <div suppressHydrationWarning className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                        {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'Not set'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</h3>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        className="w-full text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none transition-all"
                                    />
                                ) : (
                                    <div suppressHydrationWarning className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Labels</h3>
                            {isEditing ? (
                                <input
                                    value={editLabels}
                                    onChange={(e) => setEditLabels(e.target.value)}
                                    placeholder="Bug, Feature, Backend (virgülle ayırın)"
                                    className="w-full text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none transition-all"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {task.labels && task.labels.length > 0 ? (
                                        task.labels.map((label, index) => (
                                            <span key={index} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                                {label}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No labels</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                            {isEditing ? (
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none transition-all resize-none"
                                    placeholder="Açıklama ekleyin..."
                                />
                            ) : (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {task.description || 'No description provided.'}
                                </p>
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                                <span>Attachments</span>
                                <label className="cursor-pointer text-stitch-blue hover:underline text-xs capitalize flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    Add New
                                    <input type="file" className="hidden" multiple onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </h3>
                            {uploading && <div className="text-xs text-blue-500 mb-2 flex items-center gap-2"><div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500"></div>Yükleniyor...</div>}

                            {task.media_urls && task.media_urls.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {task.media_urls.map((url, idx) => (
                                        <a href={url} target="_blank" rel="noreferrer" key={idx} className="group relative block aspect-video overflow-hidden rounded-xl bg-gray-100 border border-gray-200 hover:border-stitch-blue transition-colors">
                                            <img src={url} alt={`Attachment ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="material-symbols-outlined text-white drop-shadow-md">open_in_new</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                                    <p className="text-xs text-gray-400">No attachments yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Right) - Comments */}
                    <div className="w-96 border-l border-gray-100 bg-gray-50/50 flex flex-col">
                        <div className="p-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">forum</span>
                                Comments
                                {comments.length > 0 && <span className="text-xs text-gray-400 font-normal">({comments.length})</span>}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {loadingComments ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-stitch-blue"></div>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-stitch-bg-dark text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            {comment.author_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm border border-gray-100 text-sm text-gray-700">
                                                {comment.content}
                                            </div>
                                            <div className="mt-1 ml-1 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                                <span>{comment.author_name}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span suppressHydrationWarning>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No comments yet. Be the first!
                                </div>
                            )}
                            <div ref={commentEndRef} />
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendComment} className="relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-12 py-3 text-sm focus:border-stitch-blue focus:ring-stitch-blue outline-none transition-all"
                                    disabled={sendingComment}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || sendingComment}
                                    className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center rounded-lg bg-stitch-blue text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
