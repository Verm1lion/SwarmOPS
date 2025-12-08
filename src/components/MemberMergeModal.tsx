import { ProjectMember } from '../types';
import { X, User, Check, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MemberMergeModalProps {
  duplicates: ProjectMember[];
  confidence: 'high' | 'medium' | 'low';
  onMerge: (oldMemberId: string) => void;
  onSkip: () => void;
}

export function MemberMergeModal({ duplicates, confidence, onMerge, onSkip }: MemberMergeModalProps) {
  if (duplicates.length === 0) return null;

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceText = () => {
    switch (confidence) {
      case 'high': return 'Yüksek Eşleşme';
      case 'medium': return 'Orta Eşleşme';
      case 'low': return 'Düşük Eşleşme';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bu Siz Misiniz?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aynı projede benzer bir hesap bulundu. Birleştirmek ister misiniz?
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceColor()} bg-opacity-10`}>
              {getConfidenceText()}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {duplicates.map((duplicate) => (
            <div
              key={duplicate.id}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: duplicate.avatarColor }}
                >
                  {duplicate.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {duplicate.displayName}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {duplicate.role}
                    </span>
                  </div>
                  {duplicate.lastSeenAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Son görülme: {format(new Date(duplicate.lastSeenAt), 'dd MMM yyyy, HH:mm')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onMerge(duplicate.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Evet, Birleştir
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Hayır, Yeni Hesap Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}

