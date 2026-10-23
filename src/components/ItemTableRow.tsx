import { FreezerItem, ZoneInfo } from '../types/inventory';
import { CATEGORIES, PACKAGING_LABELS, getFreshnessStatus } from '../data/defaults';
import { Star, Minus, Plus, Flame, Edit3, Trash2, Clock, QrCode } from 'lucide-react';

interface ItemTableRowProps {
  item: FreezerItem;
  zones?: ZoneInfo[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleStar: (id: string) => void;
  onStartThaw: (item: FreezerItem) => void;
  onEdit: (item: FreezerItem) => void;
  onDelete: (id: string) => void;
  onShowQr?: (item: FreezerItem) => void;
}

export const ItemTableRow: React.FC<ItemTableRowProps> = ({
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
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
      {/* Star / Priority */}
      <td className="py-3 px-3 w-8 text-center">
        <button
          type="button"
          onClick={() => onToggleStar(item.id)}
          className={`cursor-pointer transition-colors ${
            item.isStarred ? 'text-amber-500' : 'text-slate-200 group-hover:text-slate-400'
          }`}
          title={item.isStarred ? 'Stjernemarkeret' : 'Stjernemarkér til madplan'}
        >
          <Star className={`w-3.5 h-3.5 ${item.isStarred ? 'fill-current' : ''}`} />
        </button>
      </td>

      {/* Item Name + Notes preview */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{item.name}</span>
          {item.thawing && (
            <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Optør
            </span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">{item.notes}</p>
        )}
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
        {category?.label}
      </td>

      {/* Location / Zone */}
      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
        {zoneName}
      </td>

      {/* Quantity with quick buttons */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded disabled:opacity-30 transition-colors cursor-pointer"
            title="Mindsk mængde"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-1.5 text-xs font-mono font-medium text-slate-900 tabular-nums">
            {item.quantity} <span className="font-sans text-[11px] text-slate-500">{item.unit}</span>
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
            title="Øg mængde"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Frozen Date */}
      <td className="py-3 px-4 text-right text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
        {item.frozenDate}
      </td>

      {/* Expiration & Freshness Status */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="text-xs font-mono tabular-nums text-slate-700">{item.bestByDate}</div>
        <div className={`text-[11px] ${getStatusColor()}`}>{freshness.label}</div>
      </td>

      {/* Packaging */}
      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap hidden md:table-cell">
        {PACKAGING_LABELS[item.packaging] || item.packaging}
      </td>

      {/* Action Buttons */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onStartThaw(item)}
            className="p-1 text-slate-400 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Tø op i køleskab"
          >
            <Flame className="w-3.5 h-3.5" />
          </button>
          {onShowQr && (
            <button
              type="button"
              onClick={() => onShowQr(item)}
              className="p-1 text-slate-400 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title="Vis eller print QR-kode til beholder"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Redigér"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Slet / forbrugt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
