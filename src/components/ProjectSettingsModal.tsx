import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { X, Save, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import { MemberRole } from '../types';
import { MemberProfileEditor } from './MemberProfileEditor';

interface ProjectSettingsModalProps {
  onClose: () => void;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function ProjectSettingsModal({ onClose }: ProjectSettingsModalProps) {
  const { activeProject, visibleMembers, currentMember, updateProject, regenerateJoinCode, updateMemberRole, removeMember } = usePlanner();
  const [formData, setFormData] = useState({
    name: activeProject?.name || '',
    description: activeProject?.description || '',
    color: activeProject?.color || '#3B82F6'
  });
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  if (!activeProject || !currentMember) return null;

  const isOwnerOrAdmin = currentMember.role === 'owner' || currentMember.role === 'admin';

  const handleSave = async () => {
    await updateProject(formData);
    onClose();
  };

  const handleRegenerateCode = async () => {
    await regenerateJoinCode();
    setShowRegenerateConfirm(false);
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  disabled={!isOwnerOrAdmin}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Join Code */}
          {isOwnerOrAdmin && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Join Code</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="font-mono text-lg font-bold">{activeProject.joinCode}</p>
                </div>
                {!showRegenerateConfirm ? (
                  <button
                    onClick={() => setShowRegenerateConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerateCode}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowRegenerateConfirm(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Member Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Members</h3>
            <div className="space-y-2">
              {visibleMembers.map((member) => {
                const isCurrentMember = member.id === currentMember.id;
                const isEditing = editingMemberId === member.id;

                return (
                  <div key={member.id}>
                    {isEditing && isCurrentMember ? (
                      <MemberProfileEditor
                        memberId={member.id}
                        onClose={() => setEditingMemberId(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: member.avatarColor }}
                          >
                            {member.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{member.displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentMember && (
                            <button
                              onClick={() => setEditingMemberId(member.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isOwnerOrAdmin && !isCurrentMember && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

