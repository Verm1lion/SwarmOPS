import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { Task } from '../types';
import { X, Send, Calendar, User, Paperclip, Download, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

const statusColors: Record<string, string> = {
  ideas: 'bg-purple-100 text-purple-800',
  todo: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800'
};

const statusLabels: Record<string, string> = {
  ideas: 'Ideas',
  todo: 'To-Do',
  in_progress: 'In Progress',
  done: 'Done'
};

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const { members, visibleMembers, comments, attachments, addComment, currentMember, error } = usePlanner();
  const [commentText, setCommentText] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  // Use visibleMembers to find assignee, but fallback to members if assignee is admin (for display purposes)
  const assignee = visibleMembers.find(m => m.id === task.assigneeMemberId) || 
                   members.find(m => m.id === task.assigneeMemberId);
  const taskComments = comments.filter(c => c.taskId === task.id);
  const taskAttachments = attachments.filter(a => a.taskId === task.id);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCommentFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setCommentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!commentText.trim() && commentFiles.length === 0) || !currentMember) return;
    
    setUploading(true);
    try {
      await addComment(task.id, commentText, commentFiles.length > 0 ? commentFiles : undefined);
      setCommentText('');
      setCommentFiles([]);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to add comment:', err);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-6">
            {/* Task Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
              {assignee && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: assignee.avatarColor }}
                  >
                    {assignee.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{assignee.displayName}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Task Attachments */}
            {taskAttachments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments ({taskAttachments.length})</h3>
                <div className="space-y-2">
                  {taskAttachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{attachment.title}</span>
                      {attachment.fileSize && (
                        <span className="text-xs text-gray-500">
                          {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                      <Download className="w-4 h-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({taskComments.length})
              </h3>

              <div className="space-y-4 mb-6">
                {taskComments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
                ) : (
                  taskComments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                          style={{
                            backgroundColor: visibleMembers.find(m => m.id === comment.authorMemberId)?.avatarColor || 
                                           members.find(m => m.id === comment.authorMemberId)?.avatarColor || '#6B7280'
                          }}
                        >
                          {comment.authorNameSnapshot.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{comment.authorNameSnapshot}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              {currentMember && (
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: currentMember.avatarColor }}
                    >
                      {currentMember.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={(!commentText.trim() && commentFiles.length === 0) || uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {uploading ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                  {commentFiles.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {commentFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

