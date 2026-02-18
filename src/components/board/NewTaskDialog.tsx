'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createTask, uploadFile } from '@/app/actions/task'
import { Plus } from 'lucide-react'
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

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEsc)
        }
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const form = e.currentTarget
            const formData = new FormData(form)
            const uploadedUrls: string[] = []

            if (attachments.length > 0) {
                setUploading(true)
                for (const file of attachments) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${uuidv4()}.${fileExt}`
                    const filePath = `${projectId}/${fileName}`

                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('path', filePath)

                    const uploadResult = await uploadFile(uploadFormData)

                    if (uploadResult.error || !uploadResult.url) {
                        console.error('Upload Error:', uploadResult.error)
                        alert('Dosya yüklenirken hata oluştu: ' + file.name)
                        continue
                    }

                    uploadedUrls.push(uploadResult.url)
                }
                setUploading(false)
            }

            // Append each URL to formData
            uploadedUrls.forEach((url: string) => {
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
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 scale-100 animate-in zoom-in-95 duration-200 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Title</label>
                        <input
                            name="title"
                            required
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all placeholder:text-gray-400"
                            placeholder="e.g. Redesign Homepage"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue resize-none transition-all placeholder:text-gray-400"
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Column</label>
                            <div className="relative">
                                <select
                                    name="columnId"
                                    defaultValue={defaultColumnId || "IDEA"}
                                    className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all cursor-pointer"
                                >
                                    <option value="IDEA">Idea</option>
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Priority</label>
                            <div className="relative">
                                <select
                                    name="priority"
                                    className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Labels</label>
                        <input
                            name="labels"
                            placeholder="e.g. Bug, Feature, Backend (comma separated)"
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-stitch-blue focus:bg-white focus:ring-1 focus:ring-stitch-blue transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Attachments</label>
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
