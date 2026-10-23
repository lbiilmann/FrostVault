import React from 'react';
import { FreezerItem, ZoneInfo } from '../types/inventory';
import { DEFAULT_ZONES, CATEGORIES, PACKAGING_LABELS } from '../data/defaults';
import { Printer, Download, Upload, RotateCcw, FileText } from 'lucide-react';

interface PrintManifestProps {
  items: FreezerItem[];
  zones?: ZoneInfo[];
  onResetDemoData: () => void;
  onImportItems: (newItems: FreezerItem[]) => void;
}

export const PrintManifest: React.FC<PrintManifestProps> = ({
  items,
  zones = DEFAULT_ZONES,
  onResetDemoData,
  onImportItems,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const zonesMap = zones.reduce((acc, z) => {
    acc[z.id] = z;
    return acc;
  }, {} as Record<string, ZoneInfo>);

  const handleExportCSV = () => {
    const headers = ['Varenavn', 'Kategori', 'Antal', 'Enhed', 'Placering', 'FrossetDato', 'BedstFoerDato', 'Emballage', 'Noter'];
    const rows = items.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      `"${CATEGORIES[i.category]?.label || i.category}"`,
      i.quantity,
      `"${i.unit}"`,
      `"${zonesMap[i.zone]?.name || i.zone}"`,
      i.frozenDate,
      i.bestByDate,
      `"${PACKAGING_LABELS[i.packaging] || i.packaging}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FrostVault_Fryseroversigt_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FrostVault_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleJSONFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          onImportItems(parsed);
        } else {
          alert('Ugyldigt backup-filformat.');
        }
      } catch (err) {
        alert('Kunne ikke indlæse JSON-filen.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden when printing) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lågeseddel til fryseren & Backup</h2>
            <p className="text-xs text-slate-500 mt-1">
              Udskriv denne fysiske oversigt og sæt den fast med en magnet på fryserlågen, eller eksporter dine data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print lågeseddel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksportér CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <label className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Gendan JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleJSONFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetDemoData}
              className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Gendan standard eksempelliste"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nulstil til demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 friendly layout) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 print:border-none print:p-0 print:shadow-none shadow-xs">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FROSTVAULT FRYSERSKEMA</h1>
            <p className="text-xs text-slate-600 mt-1">
              Aktiv fryserstatus · Opdateret: 21. oktober 2026 · Varer i alt: {items.length} · Hylder: {zones.length}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Måltemperatur: -18°C</div>
            <div>Sættes på fryserens yderside</div>
          </div>
        </div>

        {/* Grouped by Zone */}
        <div className="space-y-6">
          {zones.map((zoneInfo) => {
            const zoneItems = items.filter((i) => i.zone === zoneInfo.id);

            return (
              <div key={zoneInfo.id} className="break-inside-avoid">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {zoneInfo.name} ({zoneItems.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 italic">
                    {zoneInfo.suggestedUsage}
                  </span>
                </div>

                {zoneItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">Ingen varer i dette afsnit pt.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {zoneItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 print:border-black" />
                          <span className="font-semibold text-slate-900 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 shrink-0 font-mono text-[11px]">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span>inden {item.bestByDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Printable Footer with Safe Handling Reminders */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
          <span>Husk FIFO-princippet (First In, First Out). Luk poser tæt for at modvirke frostskader.</span>
          <span>FrostVault Frysersystem</span>
        </div>
      </div>
    </div>
  );
};
