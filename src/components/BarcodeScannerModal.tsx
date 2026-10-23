import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FreezerItem, ZoneInfo } from '../types/inventory';
import { CATEGORIES } from '../data/defaults';
import {
  X,
  Camera,
  Upload,
  Keyboard,
  Barcode,
  QrCode,
  CheckCircle2,
  Plus,
  Minus,
  Flame,
  Loader2,
  PackageSearch,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FreezerItem[];
  zones: ZoneInfo[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onStartThaw: (item: FreezerItem) => void;
  onAddNewScannedItem: (prefill: { name: string; barcode?: string; category?: any }) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  zones,
  onUpdateQuantity,
  onStartThaw,
  onAddNewScannedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'file' | 'manual'>('camera');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedItem, setMatchedItem] = useState<FreezerItem | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupProduct, setLookupProduct] = useState<{ name: string; brand?: string; category?: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5-qr-reader-viewport';

  // Map of zones
  const zonesMap = zones.reduce((acc, z) => {
    acc[z.id] = z;
    return acc;
  }, {} as Record<string, ZoneInfo>);

  // Sound beep on successful scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);

      if ('vibrate' in navigator) {
        navigator.vibrate(80);
      }
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  // Start live camera scanning
  const startCamera = async () => {
    try {
      setScannerError(null);
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {}
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Frame error (no code found in frame), keep scanning quietly
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      setScannerError(
        'Kunne ikke starte kameraet. Sørg for at give browseren tilladelse til kameraadgang, eller brug fil-upload / manuel indtastning.'
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {}
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedCode) {
      // Small timeout to allow DOM element to mount
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, activeTab, scannedCode]);

  // Handle scanned text (barcode number or QR data)
  const handleCodeDetected = async (code: string) => {
    playScanBeep();
    stopCamera();
    setScannedCode(code);
    setLookupLoading(true);
    setLookupProduct(null);

    // 1. Check if an item in the freezer matches either name, id, or notes contains barcode
    const found = items.find(
      (item) =>
        item.id === code ||
        item.name.toLowerCase().includes(code.toLowerCase()) ||
        item.notes?.includes(code)
    );

    if (found) {
      setMatchedItem(found);
      setLookupLoading(false);
      return;
    }

    setMatchedItem(null);

    // 2. If it looks like a standard EAN/UPC barcode (numbers only, 8-14 digits), lookup Open Food Facts!
    const isEAN = /^\d{8,14}$/.test(code.trim());
    if (isEAN) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code.trim()}.json`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 1 && data.product) {
            const p = data.product;
            const productName =
              p.product_name_da || p.product_name || p.generic_name_da || p.generic_name || 'Vare fundet';
            const brand = p.brands || '';

            // Detect category guess
            let catGuess = 'prepared_meals';
            const catTags = (p.categories_tags || []).join(' ').toLowerCase();
            if (catTags.includes('meat') || catTags.includes('viande') || catTags.includes('poultry') || catTags.includes('kylling') || catTags.includes('kød')) {
              catGuess = 'meat_poultry';
            } else if (catTags.includes('fish') || catTags.includes('seafood') || catTags.includes('poisson') || catTags.includes('fisk') || catTags.includes('rejer')) {
              catGuess = 'seafood';
            } else if (catTags.includes('vegetable') || catTags.includes('fruit') || catTags.includes('légumes') || catTags.includes('bær') || catTags.includes('ærter')) {
              catGuess = 'vegetables_fruits';
            } else if (catTags.includes('bread') || catTags.includes('boulangerie') || catTags.includes('brød') || catTags.includes('kage')) {
              catGuess = 'baked_goods';
            } else if (catTags.includes('ice') || catTags.includes('glace') || catTags.includes('dessert') || catTags.includes('is')) {
              catGuess = 'desserts_ice_cream';
            } else if (catTags.includes('soup') || catTags.includes('fond') || catTags.includes('suppe')) {
              catGuess = 'soups_stocks';
            } else if (catTags.includes('butter') || catTags.includes('smør') || catTags.includes('dairy')) {
              catGuess = 'ingredients_pantry';
            }

            setLookupProduct({
              name: brand ? `${brand} ${productName}` : productName,
              brand,
              category: catGuess,
            });
          }
        }
      } catch (err) {
        console.warn('Open Food Facts lookup error:', err);
      }
    }

    setLookupLoading(false);
  };

  // Image file scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decoded = await html5QrCode.scanFile(file, true);
      handleCodeDetected(decoded);
    } catch (err: any) {
      console.warn('File scan error:', err);
      setScannerError('Ingen stregkode eller QR-kode blev fundet i det valgte billede. Prøv et skarpere billede.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode.trim());
  };

  const resetScanner = () => {
    setScannedCode(null);
    setMatchedItem(null);
    setLookupProduct(null);
    setScannerError(null);
    if (activeTab === 'camera') {
      setTimeout(() => startCamera(), 200);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-800">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Stregkode- & QR-læser</span>
              </h3>
              <p className="text-xs text-slate-500">
                Scan fødevarepakker eller QR-koder for hurtigt overblik
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Mode Switcher (only when not showing results) */}
        {!scannedCode && (
          <div className="px-6 pt-3">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('file');
                }}
                className={`py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Vælg billede</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('manual');
                }}
                className={`py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Indtast kode</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Result View when a code is scanned */}
          {scannedCode ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-cyan-800 uppercase tracking-wider block">
                    Scannet kode
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                    {scannedCode}
                  </span>
                </div>
                <button
                  onClick={resetScanner}
                  className="px-3 py-1.5 text-xs font-medium text-cyan-800 bg-white hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan igen</span>
                </button>
              </div>

              {lookupLoading ? (
                <div className="py-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-600 mb-2" />
                  <p className="text-xs">Søger i fryseren og i fødevaredatabasen...</p>
                </div>
              ) : matchedItem ? (
                /* Item already exists in freezer! */
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Varen findes allerede i din fryser!</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{matchedItem.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{CATEGORIES[matchedItem.category]?.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-800">
                        Placering: {zonesMap[matchedItem.zone]?.name || matchedItem.zone}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Nuværende lager:</span>
                      <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                        {matchedItem.quantity} {matchedItem.unit}
                      </span>
                    </div>

                    {/* Quick quantity adjustment */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(matchedItem.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Træk 1 pakke fra (forbrugt)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(matchedItem.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Tilføj 1 pakke mere"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onStartThaw(matchedItem);
                        onClose();
                      }}
                      className="flex-1 py-2 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start optøning i køleskabet</span>
                    </button>
                  </div>
                </div>
              ) : lookupProduct ? (
                /* Product recognized via barcode database */
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-800 text-xs font-semibold">
                    <PackageSearch className="w-4 h-4 text-cyan-700" />
                    <span>Vare fundet i fødevaredatabasen (Open Food Facts):</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{lookupProduct.name}</h4>
                    {lookupProduct.brand && (
                      <p className="text-xs text-slate-500 mt-0.5">Mærke: {lookupProduct.brand}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Denne vare er ikke registreret i fryseren endnu. Vil du lægge den ind?
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onAddNewScannedItem({
                        name: lookupProduct.name,
                        barcode: scannedCode,
                        category: lookupProduct.category,
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Læg "{lookupProduct.name}" i fryseren</span>
                  </button>
                </div>
              ) : (
                /* Unknown code */
                <div className="p-5 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-slate-600">
                    Koden blev aflæst, men varen findes ikke i fryseren endnu.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onAddNewScannedItem({
                        name: `Vare (${scannedCode})`,
                        barcode: scannedCode,
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Opret ny vare med denne stregkode</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tab 1: Live Camera View */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center">
                    <div id={readerElementId} className="w-full h-full object-cover" />

                    {/* Viewfinder Target Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-44 border-2 border-cyan-400 rounded-xl relative shadow-2xl">
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />
                          {/* Laser Scan Line */}
                          <div className="w-full h-0.5 bg-cyan-400/80 shadow-md animate-pulse absolute top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-xs text-slate-500">
                    Ret kameraet mod stregkoden på fødevarepakken eller mod en QR-kode.
                  </p>
                </div>
              )}

              {/* Tab 2: File Upload */}
              {activeTab === 'file' && (
                <div className="space-y-3">
                  <div id="file-scanner-temp" className="hidden" />
                  <label className="border-2 border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-800 block">
                      Vælg et billede med en stregkode eller QR-kode
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Understøtter JPG, PNG, WEBP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab 3: Manual Input */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Indtast stregkodenummer (EAN / UPC / ID)
                    </label>
                    <input
                      type="text"
                      placeholder="f.eks. 5701234567890"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Slå stregkode op
                  </button>
                </form>
              )}

              {/* Scanner error */}
              {scannerError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  {scannerError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};
