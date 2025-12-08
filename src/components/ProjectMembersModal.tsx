import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Project, ProjectMember, MemberRole } from '../types';
import { X, Plus, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectMembersModalProps {
  project: Project;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function ProjectMembersModal({ project, onClose }: ProjectMembersModalProps) {
  const { getProjectMembers, addMemberToProject, removeMemberFromProject, updateMemberInProject } = useAdmin();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    displayName: '',
    avatarColor: AVATAR_COLORS[0],
    role: 'member' as MemberRole
  });

  useEffect(() => {
    loadMembers();
  }, [project.id]);

  const loadMembers = async () => {
    setLoading(true);
    const membersList = await getProjectMembers(project.id);
    setMembers(membersList);
    setLoading(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.displayName.trim()) return;

    try {
      await addMemberToProject(project.id, newMember.displayName, newMember.avatarColor, newMember.role);
      setNewMember({ displayName: '', avatarColor: AVATAR_COLORS[0], role: 'member' });
      setShowAddForm(false);
      await loadMembers();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Add member error:', err);
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeMemberFromProject(project.id, memberId);
      await loadMembers();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Remove member error:', err);
      }
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    try {
      await updateMemberInProject(project.id, memberId, { role: newRole });
      await loadMembers();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Update role error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.name} - Members
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage project members
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Members ({members.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={newMember.displayName}
                  onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewMember({ ...newMember, avatarColor: color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        newMember.avatarColor === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as MemberRole })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No members found
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {member.displayName}
                        </h4>
                        {member.isSystemAdmin && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            SYSTEM ADMIN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Role: {member.role}</span>
                        {member.lastSeenAt && (
                          <span>Last seen: {format(new Date(member.lastSeenAt), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                        className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                        disabled={member.isSystemAdmin}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.role === 'owner' || member.isSystemAdmin}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={member.role === 'owner' || member.isSystemAdmin ? 'Cannot remove owner or system admin' : 'Remove member'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

