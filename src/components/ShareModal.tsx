import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Share2, Smartphone, MessageSquare } from 'lucide-react';
import QRCode from 'qrcode';
import { ShoppingItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  items
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR Code:', err);
      });
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFormattedList = () => {
    const pendingItems = items.filter(it => it.status === 'pendente');
    const collectedItems = items.filter(it => it.status === 'no_carrinho');

    let text = `⚔️ **LISTA DE CRAFT & MATERIAIS DA GUILDA** ⚔️\n\n`;

    if (pendingItems.length > 0) {
      text += `📌 **PENDENTES (${pendingItems.length}):**\n`;
      pendingItems.forEach(it => {
        const assignees = it.nameList && it.nameList.length > 0 ? ` [${it.nameList.join(', ')}]` : '';
        text += `▫️ [ ] ${it.name} - ${it.quantity} ${it.unit || 'un'}${assignees}\n`;
      });
      text += '\n';
    }

    if (collectedItems.length > 0) {
      text += `✅ **COLETADOS (${collectedItems.length}):**\n`;
      collectedItems.forEach(it => {
        const by = it.collectedByName ? ` (por ${it.collectedByName})` : '';
        text += `▫️ [X] ${it.name} - ${it.quantity} ${it.unit || 'un'}${by}\n`;
      });
      text += '\n';
    }

    text += `🔗 Acesse a lista em tempo real: ${currentUrl}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Compartilhar Lista</h2>
              <p className="text-xs text-slate-400">Sincronização entre dispositivos e guilda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-center">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 inline-block">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code da Lista" 
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  Gerando QR Code...
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Aponte a câmera do celular para abrir instantaneamente</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition active:scale-98"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copiar Link de Acesso</span>
                </>
              )}
            </button>

            {/* Copy Discord/WhatsApp Formatted Checklist */}
            <button
              onClick={handleCopyFormattedList}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-98"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Checklist Formatada Copiada!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Copiar Checklist para Discord / Zap</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
