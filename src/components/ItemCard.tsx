import { FreezerItem, ZoneInfo } from '../types/inventory';
import { CATEGORIES, PACKAGING_LABELS, getFreshnessStatus } from '../data/defaults';
import { Star, Minus, Plus, Flame, Clock, Trash2, Edit3, QrCode } from 'lucide-react';

interface ItemCardProps {
  item: FreezerItem;
  zones?: ZoneInfo[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleStar: (id: string) => void;
  onStartThaw: (item: FreezerItem) => void;
  onEdit: (item: FreezerItem) => void;
  onDelete: (id: string) => void;
  onShowQr?: (item: FreezerItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  zones = [],
  onUpdateQuantity,
  onToggleStar,
  onStartThaw,
  onEdit,
  onDelete,
  onShowQr,
}) => {
  const category = CATEGORIES[item.category];
  const matchedZone = zones.find((z) => z.id === item.zone);
  const zoneName = matchedZone?.name || item.zone;
  const freshness = getFreshnessStatus(item.bestByDate);

  const getStatusColor = () => {
    switch (freshness.status) {
      case 'expired':
        return 'text-rose-600 font-semibold';
      case 'urgent':
        return 'text-amber-600 font-semibold';
      case 'expiring_soon':
        return 'text-amber-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Unboxed metadata line + Star Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Clean unboxed metadata kicker */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{category?.label || 'Generelt'}</span>
              <span aria-hidden="true">·</span>
              <span>{zoneName || 'Opbevaring'}</span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 mt-1 truncate tracking-tight" title={item.name}>
              {item.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onToggleStar(item.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              item.isStarred
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-slate-300 hover:text-slate-400'
            }`}
            title={item.isStarred ? 'Stjernemarkeret til madplan' : 'Stjernemarkér til madplan'}
          >
            <Star className={`w-4 h-4 ${item.isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Notes (if present) */}
        {item.notes && (
          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-lg border border-slate-100">
            {item.notes}
          </p>
        )}

        {/* Date & Packaging Metadata */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Frosset den:</span>
            <span className="font-mono tabular-nums text-slate-700">{item.frozenDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Bedst før:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono tabular-nums text-slate-700">{item.bestByDate}</span>
              <span aria-hidden="true">·</span>
              <span className={getStatusColor()}>{freshness.label}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Emballage:</span>
            <span className="text-slate-600">{PACKAGING_LABELS[item.packaging] || item.packaging}</span>
          </div>
        </div>

        {/* Thawing status indicator (if active) */}
        {item.thawing && (
          <div className="mt-3 p-2 bg-cyan-50 rounded-lg border border-cyan-200/80 text-xs text-cyan-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-700 animate-spin" />
              <span className="font-medium">Tør op i køleskab</span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-cyan-700 font-medium">Aktiv</span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer: Quantity Stepper & Quick Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Inline Quantity Stepper */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Formindsk mængde med 1"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 text-xs font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
            {item.quantity} <span className="font-sans font-normal text-slate-500 text-[11px]">{item.unit}</span>
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            title="Forøg mængde med 1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStartThaw(item)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              item.thawing
                ? 'bg-cyan-100 text-cyan-800'
                : 'text-slate-600 hover:text-cyan-700 hover:bg-slate-100'
            }`}
            title="Start optøning i køleskabet"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Optø</span>
          </button>

          {onShowQr && (
            <button
              type="button"
              onClick={() => onShowQr(item)}
              className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Generer QR-kode til bøtte eller pose"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Redigér vare"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Slet eller marker som spist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
