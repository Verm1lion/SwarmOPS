'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { createTask } from '@/app/actions/task'
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface NewTaskDialogProps {
    projectId: string
    currentUser: string
    onTaskCreated: (task: any) => void
    variant?: 'primary' | 'ghost'
    defaultColumnId?: string
}

export function NewTaskDialog({ projectId, currentUser, onTaskCreated, variant = 'primary', defaultColumnId }: NewTaskDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [attachments, setAttachments] = useState<File[]>([])

    // ... handle submit ...
    // (Existing handleSubmit logic is fine, just need to update usage of defaultColumnId in the form)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const form = e.currentTarget
            const formData = new FormData(form)

            // Upload files first
            const supabase = createClient()
            const uploadedUrls: string[] = []

            if (attachments.length > 0) {
                setUploading(true)
                for (const file of attachments) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${uuidv4()}.${fileExt}`
                    const filePath = `${projectId}/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('task-attachments')
                        .upload(filePath, file)

                    if (uploadError) {
                        console.error('Upload Error:', uploadError)
                        alert('Dosya yüklenirken hata oluştu: ' + file.name)
                        continue
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('task-attachments')
                        .getPublicUrl(filePath)

                    uploadedUrls.push(publicUrl)
                }
                setUploading(false)
            }

            // Append each URL to formData
            uploadedUrls.forEach(url => {
                formData.append('media_urls', url)
            })

            // Add hidden fields
            formData.append('projectId', projectId)
            formData.append('createdBy', currentUser)

            const result = await createTask(formData)

            if (result?.success) {
                setIsOpen(false)
                setAttachments([])
                // Reset form or better yet, since we are using uncontrolled inputs via FormData, valid enough.
                // Reset form
                setIsOpen(false)
                setAttachments([])
            } else {
                alert('Hata oluştu: ' + result?.error)
            }
        } catch (error) {
            console.error(error)
            alert('Beklenmedik bir hata oluştu.')
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }

    // Use portal to escape parent stacking contexts (like sticky headers)
    if (!isOpen) {
        if (variant === 'ghost') {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs font-medium hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                    + Add Issue
                </button>
            )
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-sm transition-all active:scale-95"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>New Issue</span>
            </button>
        )
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            name="title"
                            required
                            className="w-full rounded-xl border-gray-200 px-4 py-2.5 text-sm focus:border-stitch-blue focus:ring-stitch-blue transition-all"
                            placeholder="e.g. Redesign Homepage"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full rounded-xl border-gray-200 px-4 py-2.5 text-sm focus:border-stitch-blue focus:ring-stitch-blue resize-none transition-all"
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
                            <select
                                name="columnId"
                                defaultValue={defaultColumnId || "IDEA"}
                                className="w-full rounded-xl border-gray-200 px-4 py-2.5 text-sm focus:border-stitch-blue focus:ring-stitch-blue transition-all"
                            >
                                <option value="IDEA">Idea</option>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                className="w-full rounded-xl border-gray-200 px-4 py-2.5 text-sm focus:border-stitch-blue focus:ring-stitch-blue transition-all"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="material-symbols-outlined text-gray-400 text-3xl mb-2">cloud_upload</span>
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setAttachments(Array.from(e.target.files))
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                                {attachments.length} file(s) selected
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-stitch-blue px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? (uploading ? 'Uploading...' : 'Creating...') : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}
