import React, { useState } from 'react';
import { FreezerItem, ZoneInfo, ZoneId } from '../types/inventory';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Check, X, AlertTriangle, Layers, RotateCcw } from 'lucide-react';

interface ManageShelvesProps {
  zones: ZoneInfo[];
  items: FreezerItem[];
  onAddZone: (newZone: Omit<ZoneInfo, 'id'>) => void;
  onUpdateZone: (id: ZoneId, updated: Partial<ZoneInfo>) => void;
  onDeleteZone: (id: ZoneId, reassignToZoneId?: ZoneId) => void;
  onReorderZones: (reordered: ZoneInfo[]) => void;
  onResetZones: () => void;
}

export const ManageShelves: React.FC<ManageShelvesProps> = ({
  zones,
  items,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onReorderZones,
  onResetZones,
}) => {
  // Editing state
  const [editingZoneId, setEditingZoneId] = useState<ZoneId | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsage, setEditUsage] = useState('');
  const [editCapacity, setEditCapacity] = useState(12);

  // New Zone State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newCapacity, setNewCapacity] = useState(12);

  // Delete with Reassign State
  const [deletingZone, setDeletingZone] = useState<ZoneInfo | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<ZoneId>('');

  const startEdit = (zone: ZoneInfo) => {
    setEditingZoneId(zone.id);
    setEditName(zone.name);
    setEditUsage(zone.suggestedUsage);
    setEditCapacity(zone.maxRecommendedItems || 12);
  };

  const cancelEdit = () => {
    setEditingZoneId(null);
  };

  const saveEdit = (id: ZoneId) => {
    if (!editName.trim()) return;
    onUpdateZone(id, {
      name: editName.trim(),
      suggestedUsage: editUsage.trim() || 'Generel fryseopbevaring',
      maxRecommendedItems: Math.max(1, editCapacity),
    });
    setEditingZoneId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddZone({
      name: newName.trim(),
      suggestedUsage: newUsage.trim() || 'Ekstra fryserum',
      maxRecommendedItems: Math.max(1, newCapacity),
    });
    setNewName('');
    setNewUsage('');
    setNewCapacity(12);
    setIsAdding(false);
  };

  const moveZone = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= zones.length) return;
    const newZones = [...zones];
    const [moved] = newZones.splice(index, 1);
    newZones.splice(targetIndex, 0, moved);
    onReorderZones(newZones);
  };

  const handleRequestDelete = (zone: ZoneInfo) => {
    const zoneItems = items.filter((i) => i.zone === zone.id);
    if (zoneItems.length > 0) {
      // Pick another zone as default reassign target
      const otherZones = zones.filter((z) => z.id !== zone.id);
      if (otherZones.length > 0) {
        setReassignTargetId(otherZones[0].id);
      }
      setDeletingZone(zone);
    } else {
      // Direct delete if empty
      if (window.confirm(`Er du sikker på, at du vil slette hylden "${zone.name}"?`)) {
        onDeleteZone(zone.id);
      }
    }
  };

  const confirmReassignAndDelete = () => {
    if (!deletingZone) return;
    onDeleteZone(deletingZone.id, reassignTargetId);
    setDeletingZone(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Fryserens Indretning</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Administrer Hylder & Skuffer
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Tilpas fryseren til netop din model. Opret nye skuffer, omdøb eksisterende hylder eller slet overskydende sektioner.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tilføj ny hylde</span>
            </button>
            <button
              onClick={onResetZones}
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Gendan standard fryserinddeling"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Shelf Form Box (Collapsible) */}
      {isAdding && (
        <div className="bg-cyan-50/70 border border-cyan-200 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-cyan-950 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-700" />
              <span>Opret ny frysehylde eller -skuffe</span>
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-cyan-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Navn på hylde / skuffe <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="f.eks. Is- og dessertskuffe, Børnenes hylde"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              />
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anbefalet brug / indhold
              </label>
              <input
                type="text"
                placeholder="f.eks. Isbægre, frosne vafler og ispinde"
                value={newUsage}
                onChange={(e) => setNewUsage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapacitet
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value) || 12)}
                className="w-full px-2 py-2 text-xs font-mono tabular-nums rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-center"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer text-center"
              >
                Gem hylde
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-xs text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Annuller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Shelves */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nuværende hylder & skuffer ({zones.length})
          </span>
          <span className="text-xs text-slate-400">
            Brug pilene til at sortere rækkefølgen oppefra og ned
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {zones.map((zone, index) => {
            const zoneItems = items.filter((i) => i.zone === zone.id);
            const isEditing = editingZoneId === zone.id;

            return (
              <div
                key={zone.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Reorder and Identity */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {/* Up / Down Reorder Arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5 sm:pt-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveZone(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Flyt op"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === zones.length - 1}
                      onClick={() => moveZone(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Flyt ned"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Level indicator */}
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shrink-0">
                    {index + 1}
                  </div>

                  {/* Edit form or Display view */}
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="Hyldenavn"
                          autoFocus
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={editUsage}
                          onChange={(e) => setEditUsage(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="Beskrivelse / anvendelse"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(parseInt(e.target.value) || 12)}
                          className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-300 text-center"
                          title="Kapacitet (maks anbefalet antal varer)"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {zone.name}
                        </h4>
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          ({zoneItems.length} {zoneItems.length === 1 ? 'vare' : 'varer'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {zone.suggestedUsage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(zone.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Gem</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Annuller
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(zone)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Redigér navn og beskrivelse"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Omdøb</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestDelete(zone)}
                        disabled={zones.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                        title={zones.length <= 1 ? 'Du skal have mindst én hylde' : 'Slet denne hylde'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation & Item Reassignment Modal */}
      {deletingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Flyt varer før sletning
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hylden <strong>"{deletingZone.name}"</strong> indeholder i øjeblikket{' '}
              <strong>
                {items.filter((i) => i.zone === deletingZone.id).length} varer
              </strong>
              . Vælg hvilken hylde disse varer skal flyttes til:
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flyt varer til:
              </label>
              <select
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
              >
                {zones
                  .filter((z) => z.id !== deletingZone.id)
                  .map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingZone(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuller
              </button>
              <button
                type="button"
                onClick={confirmReassignAndDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Flyt varer & slet hylde
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
