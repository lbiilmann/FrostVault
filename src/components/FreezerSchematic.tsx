import React from 'react';
import { FreezerItem, ZoneId, FreezerType, ZoneInfo } from '../types/inventory';
import { CATEGORIES, getFreshnessStatus } from '../data/defaults';
import { Plus, ThermometerSnowflake, Settings } from 'lucide-react';

interface FreezerSchematicProps {
  items: FreezerItem[];
  zones: ZoneInfo[];
  selectedZone: ZoneId | 'all';
  onSelectZone: (zone: ZoneId | 'all') => void;
  onAddItemToZone: (zone: ZoneId) => void;
  onViewItemDetails: (item: FreezerItem) => void;
  freezerType: FreezerType;
  setFreezerType: (type: FreezerType) => void;
  onManageZones: () => void;
}

export const FreezerSchematic: React.FC<FreezerSchematicProps> = ({
  items,
  zones,
  selectedZone,
  onSelectZone,
  onAddItemToZone,
  onViewItemDetails,
  freezerType,
  setFreezerType,
  onManageZones,
}) => {
  const getZoneItems = (zoneId: ZoneId) => items.filter((item) => item.zone === zoneId);
  const selectedZoneInfo = zones.find((z) => z.id === selectedZone);

  return (
    <div className="space-y-6">
      {/* Schematic Header and Model Selector */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Frysermodel & Rumopdeling</h2>
              <button
                type="button"
                onClick={onManageZones}
                className="px-2.5 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Tilføj, omdøb eller slet hylder"
              >
                <Settings className="w-3 h-3" />
                <span>Indret hylder</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{zones.length} aktive sektioner</span>
              <span aria-hidden="true">·</span>
              <span>Klik på en hylde/skuffe for at filtrere</span>
              <span aria-hidden="true">·</span>
              <span>Anbefalet temperatur: -18°C</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Frysertype:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFreezerType('upright')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  freezerType === 'upright'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skabsfryser
              </button>
              <button
                onClick={() => setFreezerType('bottom_freezer')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  freezerType === 'bottom_freezer'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Køle-/fryseskab
              </button>
              <button
                onClick={() => setFreezerType('chest')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  freezerType === 'chest'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kummefryser
              </button>
            </div>
          </div>
        </div>

        {/* Temperature & Cold Flow Callout Banner */}
        <div className="mt-4 p-3 rounded-lg bg-cyan-50/60 border border-cyan-100 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-900">
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>
              <strong>Kuldeprincip:</strong> Kold luft synker mod bunden. Nederste skuffe er koldest (ideel til kød og stege), mens lågehylder er bedst til smør, gær og nødder.
            </span>
          </div>
          <button
            onClick={() => onSelectZone('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              selectedZone === 'all'
                ? 'bg-cyan-700 text-white'
                : 'bg-white text-cyan-800 hover:bg-cyan-100/60 border border-cyan-200'
            }`}
          >
            Vis alle rum ({items.length})
          </button>
        </div>
      </div>

      {/* Main Freezer Diagram Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Schematic Housing */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-sm font-semibold tracking-wide text-slate-200 uppercase text-[11px]">
                {freezerType === 'upright'
                  ? 'NoFrost Skabsfryser'
                  : freezerType === 'bottom_freezer'
                  ? 'Udtræksskuffe (Køle-/Fryseskab)'
                  : 'Dybdekummefryser med kurve'}
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-300 tabular-nums">
              -18,2°C · Optimal frost
            </span>
          </div>

          {/* Compartments Stack */}
          <div className="space-y-3">
            {zones.map((zone, index) => {
              const zoneItems = getZoneItems(zone.id);
              const isSelected = selectedZone === zone.id;
              const maxItems = zone.maxRecommendedItems || 12;
              const fillPercent = Math.min(100, Math.round((zoneItems.length / maxItems) * 100));

              return (
                <div
                  key={zone.id}
                  onClick={() => onSelectZone(isSelected ? 'all' : zone.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-700/80 flex items-center justify-center text-xs font-bold text-cyan-300 font-mono">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white tracking-tight">{zone.name}</h4>
                          {isSelected && (
                            <span className="text-[10px] text-cyan-300 font-medium">Valgt</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{zone.suggestedUsage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Capacity Indicator */}
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-mono text-slate-300 tabular-nums">
                          {zoneItems.length} varer
                        </div>
                        <div className="w-20 bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fillPercent > 90 ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.max(8, fillPercent)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddItemToZone(zone.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title={`Tilføj vare til ${zone.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Items inside this shelf */}
                  {zoneItems.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                      {zoneItems.map((item) => {
                        const freshness = getFreshnessStatus(item.bestByDate);
                        const isExpiringSoon = freshness.status === 'urgent' || freshness.status === 'expiring_soon';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewItemDetails(item);
                            }}
                            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 text-left cursor-pointer ${
                              isExpiringSoon
                                ? 'bg-amber-950/70 text-amber-200 border border-amber-800/80 hover:bg-amber-900'
                                : 'bg-slate-700/60 text-slate-200 hover:bg-slate-700 border border-slate-600/50'
                            }`}
                          >
                            <span className="font-medium truncate max-w-[140px]">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                              ×{item.quantity}
                            </span>
                            {isExpiringSoon && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-slate-500 italic">
                      Tom hylde · Klik "+" for at lægge varer her
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Zone Deep Dive */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                Områdeoversigt
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {selectedZone === 'all' ? 'Hele fryseren' : selectedZoneInfo?.name || 'Valgt rum'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedZone === 'all'
                  ? 'Viser alle varer på tværs af fryserens sektioner.'
                  : selectedZoneInfo?.suggestedUsage}
              </p>
            </div>

            {/* Selected Zone Inventory List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(selectedZone === 'all' ? items : getZoneItems(selectedZone)).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">Ingen varer i denne sektion endnu.</p>
                  <button
                    onClick={() => onAddItemToZone(selectedZone === 'all' ? (zones[0]?.id || 'top_shelf') : selectedZone)}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer"
                  >
                    + Læg første vare her
                  </button>
                </div>
              ) : (
                (selectedZone === 'all' ? items : getZoneItems(selectedZone)).map((item) => {
                  const freshness = getFreshnessStatus(item.bestByDate);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onViewItemDetails(item)}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="text-xs font-semibold text-slate-900 group-hover:text-cyan-700 truncate">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>{CATEGORIES[item.category]?.label}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[11px] font-mono tabular-nums ${
                              freshness.status === 'urgent'
                                ? 'text-rose-600 font-semibold'
                                : freshness.status === 'expiring_soon'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {freshness.daysRemaining > 0 ? `${freshness.daysRemaining}d tilbage` : 'Overskredet'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={() => onAddItemToZone(selectedZone === 'all' ? (zones[0]?.id || 'top_shelf') : selectedZone)}
              className="flex-1 py-2 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                Tilføj til {selectedZone === 'all' ? 'fryseren' : selectedZoneInfo?.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
