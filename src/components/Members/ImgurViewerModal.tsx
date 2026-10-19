import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ImgurViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  memberName: string;
}

export const ImgurViewerModal: React.FC<ImgurViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  memberName
}) => {
  if (!isOpen || !imageUrl) return null;

  // Normalize Imgur URL if user pasted page link instead of direct image link
  let directUrl = imageUrl;
  if (imageUrl.includes('imgur.com') && !imageUrl.includes('i.imgur.com') && !imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const id = imageUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '');
    if (id) {
      directUrl = `https://i.imgur.com/${id}.jpg`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Print de Status: {memberName}</h3>
              <p className="text-xs text-slate-400">Comprovante de Dano, Defesa e Acerto</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Original</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
          <img
            src={directUrl}
            alt={`Print do status de ${memberName}`}
            className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-2xl"
            onError={(e) => {
              // If direct URL fails, fallback to original URL
              const target = e.target as HTMLImageElement;
              if (target.src !== imageUrl) {
                target.src = imageUrl;
              }
            }}
          />
        </div>

      </div>
    </div>
  );
};
