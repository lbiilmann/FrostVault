import React, { useState, useEffect } from 'react';
import { FreezerItem, CategoryId, ZoneId, PackagingType, FreezerPreset, ZoneInfo } from '../types/inventory';
import { CATEGORIES, COMMON_PRESETS, PACKAGING_LABELS, addMonthsToDate } from '../data/defaults';
import { X } from 'lucide-react';
import { AudioTranscriber } from './AudioTranscriber';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<FreezerItem, 'id' | 'createdAt'>, existingId?: string) => void;
  initialItem?: FreezerItem | null;
  defaultZone?: ZoneId;
  zones?: ZoneInfo[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  defaultZone = 'middle_shelf',
  zones = [],
}) => {
  const today = '2026-10-21';

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('meat_poultry');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('portioner');
  const [zone, setZone] = useState<ZoneId>(defaultZone);
  const [frozenDate, setFrozenDate] = useState(today);
  const [bestByDate, setBestByDate] = useState('');
  const [packaging, setPackaging] = useState<PackagingType>('frost_pose');
  const [notes, setNotes] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setQuantity(initialItem.quantity);
      setUnit(initialItem.unit);
      setZone(initialItem.zone);
      setFrozenDate(initialItem.frozenDate);
      setBestByDate(initialItem.bestByDate);
      setPackaging(initialItem.packaging);
      setNotes(initialItem.notes || '');
      setIsStarred(!!initialItem.isStarred);
    } else {
      setName('');
      setCategory('meat_poultry');
      setQuantity(1);
      setUnit('portioner');
      setZone(defaultZone);
      setFrozenDate(today);
      setPackaging('frost_pose');
      setNotes('');
      setIsStarred(false);
      const defaultMonths = CATEGORIES['meat_poultry'].defaultMonths;
      setBestByDate(addMonthsToDate(today, defaultMonths));
    }
  }, [initialItem, defaultZone, isOpen]);

  const handleCategoryChange = (newCat: CategoryId) => {
    setCategory(newCat);
    if (!initialItem) {
      const months = CATEGORIES[newCat].defaultMonths;
      setBestByDate(addMonthsToDate(frozenDate, months));
    }
  };

  const handleFrozenDateChange = (newDate: string) => {
    setFrozenDate(newDate);
    const months = CATEGORIES[category]?.defaultMonths || 6;
    setBestByDate(addMonthsToDate(newDate, months));
  };

  const handleApplyPreset = (preset: FreezerPreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setUnit(preset.defaultUnit);
    setZone(preset.suggestedZone);
    setBestByDate(addMonthsToDate(frozenDate, preset.defaultMonths));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catMonths = CATEGORIES[category]?.defaultMonths || 6;
    const isEditMode = Boolean(initialItem && initialItem.id);
    onSave(
      {
        name: name.trim(),
        category,
        quantity: Math.max(1, Number(quantity) || 1),
        unit: unit.trim() || 'stk',
        zone,
        frozenDate,
        bestByDate: bestByDate || addMonthsToDate(frozenDate, catMonths),
        packaging,
        notes: notes.trim() || undefined,
        isStarred,
        thawing: initialItem?.thawing || null,
      },
      isEditMode ? initialItem!.id : undefined
    );
    onClose();
  };

  const isEditMode = Boolean(initialItem && initialItem.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditMode ? 'Redigér vare i fryseren' : 'Læg ny vare i fryseren'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registrér indhold, skuffeplacering og anbefalet holdbarhed
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets (Only when adding fresh) */}
          {!isEditMode && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Hurtigvalg (forslag)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRESETS.slice(0, 7).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-slate-700 transition-colors cursor-pointer text-left"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Varens navn <span className="text-rose-500">*</span>
              </label>
              <AudioTranscriber
                onTranscribed={(spokenText) => {
                  setName(spokenText);
                }}
              />
            </div>
            <input
              type="text"
              required
              placeholder="f.eks. Hakket oksekød, Hjemmelavet lasagne, Kyllingebryst"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Category & Compartment Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} (~{cat.defaultMonths} mdr.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placering i fryseren
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneId)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Antal / Mængde
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enhed / Pakkestørrelse
              </label>
              <input
                type="text"
                placeholder="f.eks. portioner, poser, bøtter, kg, stk"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Dates: Frozen Date and Best By Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dato frosset ned
              </label>
              <input
                type="date"
                value={frozenDate}
                onChange={(e) => handleFrozenDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Bedst før / Holdbar til
                </label>
                <span className="text-[11px] text-cyan-700 font-medium">
                  +{CATEGORIES[category]?.defaultMonths || 6} mdr. standard
                </span>
              </div>
              <input
                type="date"
                value={bestByDate}
                onChange={(e) => setBestByDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Packaging Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emballagetype (forebygger frostskader)
            </label>
            <select
              value={packaging}
              onChange={(e) => setPackaging(e.target.value as PackagingType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              {Object.entries(PACKAGING_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes & Cooking Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Noter, portioner eller tilberedning (valgfrit)
            </label>
            <textarea
              rows={2}
              placeholder="f.eks. Tøes op i køleskab, varmes ved 180°C i 25 min., rækker til 4 personer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Star for Priority Meal */}
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <input
              type="checkbox"
              checked={isStarred}
              onChange={(e) => setIsStarred(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
            />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Stjernemarkér denne vare til ugens madplan
              </span>
              <span className="text-[11px] text-slate-500 block">
                Fremhæver varen i "Brug først"-køen og madplanlæggeren
              </span>
            </div>
          </label>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {initialItem ? 'Gem ændringer' : 'Gem i fryseren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
