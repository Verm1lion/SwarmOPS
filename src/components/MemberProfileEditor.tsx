import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { Edit2, X, Save } from 'lucide-react';

interface MemberProfileEditorProps {
  memberId: string;
  onClose: () => void;
}

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function MemberProfileEditor({ memberId, onClose }: MemberProfileEditorProps) {
  const { members, currentMember, updateCurrentMemberProfile } = usePlanner();
  const member = members.find(m => m.id === memberId);
  
  const [displayName, setDisplayName] = useState(member?.displayName || '');
  const [avatarColor, setAvatarColor] = useState(member?.avatarColor || '#3B82F6');

  if (!member || !currentMember || member.id !== currentMember.id) return null;

  const handleSave = async () => {
    await updateCurrentMemberProfile(displayName, avatarColor);
    onClose();
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: avatarColor }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm"
            placeholder="Display Name"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setAvatarColor(color)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              avatarColor === color
                ? 'border-gray-900 dark:border-white scale-110'
                : 'border-gray-300 dark:border-slate-600'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-1 bg-primary text-white rounded text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-gray-200 dark:bg-slate-600 rounded text-sm hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

