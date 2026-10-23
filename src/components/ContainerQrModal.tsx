import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FreezerItem, ZoneInfo } from '../types/inventory';
import { CATEGORIES } from '../data/defaults';
import { X, Printer, Download, QrCode } from 'lucide-react';

interface ContainerQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FreezerItem | null;
  zone?: ZoneInfo;
}

export const ContainerQrModal: React.FC<ContainerQrModalProps> = ({
  isOpen,
  onClose,
  item,
  zone,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (item) {
      // Encode item identifier and summary
      const qrData = JSON.stringify({
        id: item.id,
        name: item.name,
        frozen: item.frozenDate,
        bestBy: item.bestByDate,
      });

      QRCode.toDataURL(qrData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <QrCode className="w-4 h-4 text-cyan-700" />
            <span>Beholder-etiket & QR</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="my-5 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white inline-block text-left shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-800 uppercase">
              FrostVault Label
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {item.frozenDate}
            </span>
          </div>

          {dataUrl ? (
            <img
              src={dataUrl}
              alt="QR-kode for frostbeholder"
              className="w-44 h-44 mx-auto my-1 object-contain"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400">
              Genererer QR...
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
              {item.name}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
              <span>{zone?.name || 'Fryser'}</span>
              <span className="font-mono text-cyan-800">Bedst før: {item.bestByDate}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Sæt denne QR-mærkat på din frysebøtte eller frysepose. Scan den direkte med appens stregkodelæser for øjeblikkeligt at se indhold og holdbarhed!
        </p>

        <div className="flex items-center justify-center gap-2">
          {dataUrl && (
            <a
              href={dataUrl}
              download={`FrostVault_QR_${item.name.replace(/\s+/g, '_')}.png`}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Gem billede</span>
            </a>
          )}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print etiket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
