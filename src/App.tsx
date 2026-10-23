import React, { useState, useEffect, useMemo } from 'react';
import { FreezerItem, CategoryId, ZoneId, FreezerType, ZoneInfo } from './types/inventory';
import {
  INITIAL_FREEZER_ITEMS,
  DEFAULT_ZONES,
  CATEGORIES,
  getFreshnessStatus,
  addMonthsToDate,
} from './data/defaults';
import { Header } from './components/Header';
import { FreezerSchematic } from './components/FreezerSchematic';
import { ManageShelves } from './components/ManageShelves';
import { ItemCard } from './components/ItemCard';
import { ItemTableRow } from './components/ItemTableRow';
import { AddItemModal } from './components/AddItemModal';
import { DefrostTracker } from './components/DefrostTracker';
import { PrintManifest } from './components/PrintManifest';
import { FreezerTipsModal } from './components/FreezerTipsModal';
import { GroundedAdviceModal } from './components/GroundedAdviceModal';
import { AudioTranscriber } from './components/AudioTranscriber';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ContainerQrModal } from './components/ContainerQrModal';
import {
  Search,
  Grid,
  List,
  ArrowUpDown,
  HelpCircle,
  PackageOpen,
  Plus,
  Layers,
  Globe,
  Barcode,
} from 'lucide-react';

const STORAGE_KEY = 'frostvault_inventory_v1';
const FREEZER_TYPE_KEY = 'frostvault_freezer_type_v1';
const ZONES_KEY = 'frostvault_zones_v1';

export default function App() {
  // Load persisted shelves/zones from localStorage or default Danish zones
  const [zones, setZones] = useState<ZoneInfo[]>(() => {
    try {
      const saved = localStorage.getItem(ZONES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read zones from localStorage', e);
    }
    return DEFAULT_ZONES;
  });

  // Load persisted items from localStorage or initial realistic Danish starter items
  const [items, setItems] = useState<FreezerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_FREEZER_ITEMS;
  });

  const [freezerType, setFreezerType] = useState<FreezerType>(() => {
    try {
      const saved = localStorage.getItem(FREEZER_TYPE_KEY);
      if (saved === 'upright' || saved === 'chest' || saved === 'bottom_freezer') return saved;
    } catch (e) {
      // fallback
    }
    return 'upright';
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed saving items to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(ZONES_KEY, JSON.stringify(zones));
    } catch (e) {
      console.error('Failed saving zones to localStorage', e);
    }
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem(FREEZER_TYPE_KEY, freezerType);
    } catch (e) {
      // ignore
    }
  }, [freezerType]);

  // Tab & View States
  const [activeTab, setActiveTab] = useState<'inventory' | 'schematic' | 'zones' | 'defrost' | 'print'>('inventory');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [zoneFilter, setZoneFilter] = useState<ZoneId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'expiring' | 'starred' | 'thawing'>('all');
  const [sortBy, setSortBy] = useState<'bestBy' | 'frozenDateDesc' | 'frozenDateAsc' | 'name' | 'quantity'>('bestBy');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FreezerItem | null>(null);
  const [addModalDefaultZone, setAddModalDefaultZone] = useState<ZoneId>(zones[0]?.id || 'top_shelf');
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrModalItem, setQrModalItem] = useState<FreezerItem | null>(null);

  // Map of zones by ID
  const zonesMap = useMemo(() => {
    return zones.reduce((acc, z) => {
      acc[z.id] = z;
      return acc;
    }, {} as Record<string, ZoneInfo>);
  }, [zones]);

  // Computed counts
  const urgentCount = useMemo(() => {
    return items.filter((i) => {
      const { status } = getFreshnessStatus(i.bestByDate);
      return status === 'urgent' || status === 'expired';
    }).length;
  }, [items]);

  const expiringCount = useMemo(() => {
    return items.filter((i) => {
      const { status } = getFreshnessStatus(i.bestByDate);
      return status === 'urgent' || status === 'expiring_soon' || status === 'expired';
    }).length;
  }, [items]);

  const thawingCount = useMemo(() => {
    return items.filter((i) => !!i.thawing).length;
  }, [items]);

  // Filtered and Sorted items list
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          const matchCat = CATEGORIES[item.category]?.label.toLowerCase().includes(q);
          const matchZone = zonesMap[item.zone]?.name?.toLowerCase().includes(q) || item.zone.toLowerCase().includes(q);
          if (!matchName && !matchNotes && !matchCat && !matchZone) return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

        // Zone filter
        if (zoneFilter !== 'all' && item.zone !== zoneFilter) return false;

        // Status filter
        if (statusFilter !== 'all') {
          const freshness = getFreshnessStatus(item.bestByDate);
          if (statusFilter === 'urgent' && freshness.status !== 'urgent' && freshness.status !== 'expired') {
            return false;
          }
          if (
            statusFilter === 'expiring' &&
            freshness.status !== 'urgent' &&
            freshness.status !== 'expiring_soon' &&
            freshness.status !== 'expired'
          ) {
            return false;
          }
          if (statusFilter === 'starred' && !item.isStarred) return false;
          if (statusFilter === 'thawing' && !item.thawing) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'bestBy') {
          return new Date(a.bestByDate).getTime() - new Date(b.bestByDate).getTime();
        }
        if (sortBy === 'frozenDateDesc') {
          return new Date(b.frozenDate).getTime() - new Date(a.frozenDate).getTime();
        }
        if (sortBy === 'frozenDateAsc') {
          return new Date(a.frozenDate).getTime() - new Date(b.frozenDate).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'da');
        }
        if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
  }, [items, searchQuery, categoryFilter, zoneFilter, statusFilter, sortBy, zonesMap]);

  // Handlers for Items
  const handleSaveItem = (itemData: Omit<FreezerItem, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...itemData }
            : item
        )
      );
    } else {
      const newItem: FreezerItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setEditingItem(null);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as FreezerItem[]
    );
  };

  const handleToggleStar = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    );
  };

  const handleStartThaw = (item: FreezerItem) => {
    if (item.thawing) {
      setActiveTab('defrost');
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              thawing: {
                startedAt: new Date().toISOString(),
                targetHours: 24,
              },
            }
          : i
      )
    );
  };

  const handleFinishThaw = (item: FreezerItem, markConsumed: boolean) => {
    if (markConsumed) {
      if (item.quantity > 1) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity - 1, thawing: null }
              : i
          )
        );
      } else {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, thawing: null } : i))
      );
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenAddInZone = (zone: ZoneId) => {
    setEditingItem(null);
    setAddModalDefaultZone(zone);
    setIsAddModalOpen(true);
  };

  const handleAddNewScannedItem = (prefill: { name: string; barcode?: string; category?: string }) => {
    const today = '2026-10-21';
    const cat: CategoryId = (prefill.category && prefill.category in CATEGORIES)
      ? (prefill.category as CategoryId)
      : 'meat_poultry';
    const defaultMonths = CATEGORIES[cat]?.defaultMonths || 6;
    const prefilledItem: FreezerItem = {
      id: '', // Blank ID marks as a new prefilled item
      name: prefill.name,
      category: cat,
      quantity: 1,
      unit: 'stk',
      zone: zones[0]?.id || 'top_shelf',
      frozenDate: today,
      bestByDate: addMonthsToDate(today, defaultMonths),
      packaging: 'frost_pose',
      notes: prefill.barcode ? `Stregkode: ${prefill.barcode}` : undefined,
      createdAt: new Date().toISOString(),
    };
    setEditingItem(prefilledItem);
    setAddModalDefaultZone(zones[0]?.id || 'top_shelf');
    setIsAddModalOpen(true);
  };

  const handleResetDemoData = () => {
    setItems(INITIAL_FREEZER_ITEMS);
    setZones(DEFAULT_ZONES);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ZONES_KEY);
  };

  const handleImportItems = (newItems: FreezerItem[]) => {
    setItems(newItems);
  };

  // Handlers for Shelves / Zones Management
  const handleAddZone = (newZoneData: Omit<ZoneInfo, 'id'>) => {
    const newId = `shelf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newZone: ZoneInfo = {
      ...newZoneData,
      id: newId,
    };
    setZones((prev) => [...prev, newZone]);
  };

  const handleUpdateZone = (id: ZoneId, updated: Partial<ZoneInfo>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updated } : z))
    );
  };

  const handleDeleteZone = (id: ZoneId, reassignToZoneId?: ZoneId) => {
    if (reassignToZoneId) {
      // Reassign all items from deleted zone to target zone
      setItems((prev) =>
        prev.map((i) => (i.zone === id ? { ...i, zone: reassignToZoneId } : i))
      );
    }
    setZones((prev) => prev.filter((z) => z.id !== id));
    if (zoneFilter === id) {
      setZoneFilter('all');
    }
  };

  const handleReorderZones = (reordered: ZoneInfo[]) => {
    setZones(reordered);
  };

  const handleResetZones = () => {
    if (window.confirm('Vil du gendanne standardhylderne?')) {
      setZones(DEFAULT_ZONES);
      localStorage.removeItem(ZONES_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header adheres to Top Bar Contract with two lines for tabs on mobile/tablet */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddItem={() => {
          setEditingItem(null);
          setAddModalDefaultZone(zones[0]?.id || 'top_shelf');
          setIsAddModalOpen(true);
        }}
        onOpenAdviceModal={() => setIsAdviceModalOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        urgentCount={urgentCount}
        thawingCount={thawingCount}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Hero Visual Banner (Single dominant visual anchor) */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 text-white min-h-[170px] flex flex-col justify-end p-6 sm:p-8">
          <img
            src="/src/assets/images/freezer_organized_storage_1792622726169.jpg"
            alt="Velorganiseret fryser"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                <span>Fryserens Hovedoversigt</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">-18°C</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Madspildsfri Fryserstyring
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl text-balance">
                Få fuldt overblik over dine frostvarer, tilpas hylderne til din fryser, og undgå madspild.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAdviceModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/70 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Spørg Google om fryseråd</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTipsModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-cyan-200 border border-slate-700/70 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Fryser-guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Strip (Always tabular numerals) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block">Varer i fryseren</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {items.length}
              </span>
              <span className="text-xs text-slate-500">
                fordelt på {zones.length} hylder
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block">Brug inden 30 dage</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">
                {expiringCount}
              </span>
              <span className="text-xs text-slate-500">
                {urgentCount > 0 ? `(${urgentCount} haster)` : 'snarlig udløb'}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block">Optøning i køleskab</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-cyan-700">
                {thawingCount}
              </span>
              <span className="text-xs text-slate-500">i gang</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block">Aktive hylder & skuffer</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {zones.length}
              </span>
              <span className="text-xs text-slate-500">sektioner indrettet</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Primary Inventory List View */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter and Search Bar Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input with Voice Search */}
                <div className="relative flex-1 flex items-center bg-slate-50/70 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500">
                  <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Søg efter varenavn, noter eller emballage (eller tryk 'Tal ind')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-2 pr-2 py-2 text-xs sm:text-sm bg-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
                    >
                      Ryd
                    </button>
                  )}
                  <div className="pr-1.5 shrink-0 border-l border-slate-200/70 pl-1.5 flex items-center gap-1">
                    <AudioTranscriber
                      onTranscribed={(text) => setSearchQuery(text)}
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="p-1.5 text-slate-500 hover:text-cyan-800 hover:bg-cyan-50 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                      title="Scan stregkode eller QR-kode"
                    >
                      <Barcode className="w-4 h-4 text-cyan-700" />
                      <span className="text-xs hidden md:inline font-medium">Scan</span>
                    </button>
                  </div>
                </div>

                {/* Right controls: Sort and View mode switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="bestBy">Bedst før (Tidligst først)</option>
                      <option value="frozenDateDesc">Frosset den (Nyeste først)</option>
                      <option value="frozenDateAsc">Frosset den (Ældste først)</option>
                      <option value="name">Varenavn (A-Å)</option>
                      <option value="quantity">Mængde (Flest)</option>
                    </select>
                  </div>

                  {/* Grid / Table View Switcher */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Kortvisning"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Kompakt tabelvisning"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs & Status Tabs */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {/* Category tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Alle kategorier ({items.length})
                  </button>
                  {Object.values(CATEGORIES).map((cat) => {
                    const count = items.filter((i) => i.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          categoryFilter === cat.id
                            ? 'bg-slate-900 text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Status Segmented Control */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs shrink-0 self-start lg:self-center">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setStatusFilter('urgent')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'urgent' ? 'bg-white text-rose-700 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Haster ({urgentCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('starred')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'starred' ? 'bg-white text-amber-600 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Stjerne
                  </button>
                  <button
                    onClick={() => setStatusFilter('thawing')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      statusFilter === 'thawing' ? 'bg-white text-cyan-800 font-semibold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Optør ({thawingCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Compartment Quick Chips */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs py-1 text-slate-500">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Filtrér hylde:</span>
              <button
                onClick={() => setZoneFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  zoneFilter === 'all' ? 'bg-cyan-100 text-cyan-900 font-semibold' : 'hover:bg-slate-200'
                }`}
              >
                Hele fryseren ({items.length})
              </button>
              {zones.map((z) => {
                const count = items.filter((i) => i.zone === z.id).length;
                return (
                  <button
                    key={z.id}
                    onClick={() => setZoneFilter(z.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      zoneFilter === z.id ? 'bg-cyan-100 text-cyan-900 font-semibold' : 'hover:bg-slate-200'
                    }`}
                  >
                    {z.name} ({count})
                  </button>
                );
              })}
              <button
                onClick={() => setActiveTab('zones')}
                className="px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-cyan-700 hover:bg-cyan-50 flex items-center gap-1 cursor-pointer ml-auto font-medium"
                title="Administrer hylder"
              >
                <Layers className="w-3 h-3" />
                <span>Indret hylder</span>
              </button>
            </div>

            {/* Inventory Content Display */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">Ingen varer matcher din søgning</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Prøv at nulstille dine søgefiltre eller tilføj en ny vare til fryseren.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setZoneFilter('all');
                      setStatusFilter('all');
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Nulstil filtre
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setAddModalDefaultZone(zones[0]?.id || 'top_shelf');
                      setIsAddModalOpen(true);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tilføj ny vare</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    zones={zones}
                    onUpdateQuantity={handleUpdateQuantity}
                    onToggleStar={handleToggleStar}
                    onStartThaw={handleStartThaw}
                    onEdit={(i) => {
                      setEditingItem(i);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={handleDeleteItem}
                    onShowQr={(i) => setQrModalItem(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-3 px-3 w-8 text-center">★</th>
                        <th className="py-3 px-4">Varenavn</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Placering</th>
                        <th className="py-3 px-4 text-right">Mængde</th>
                        <th className="py-3 px-4 text-right">Frosset den</th>
                        <th className="py-3 px-4 text-right">Bedst før</th>
                        <th className="py-3 px-4 hidden md:table-cell">Emballage</th>
                        <th className="py-3 px-4 text-right">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <ItemTableRow
                          key={item.id}
                          item={item}
                          zones={zones}
                          onUpdateQuantity={handleUpdateQuantity}
                          onToggleStar={handleToggleStar}
                          onStartThaw={handleStartThaw}
                          onEdit={(i) => {
                            setEditingItem(i);
                            setIsAddModalOpen(true);
                          }}
                          onDelete={handleDeleteItem}
                          onShowQr={(i) => setQrModalItem(i)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Freezer Schematic Layout View */}
        {activeTab === 'schematic' && (
          <FreezerSchematic
            items={items}
            zones={zones}
            selectedZone={zoneFilter}
            onSelectZone={(zone) => setZoneFilter(zone)}
            onAddItemToZone={handleOpenAddInZone}
            onViewItemDetails={(item) => {
              setEditingItem(item);
              setIsAddModalOpen(true);
            }}
            freezerType={freezerType}
            setFreezerType={setFreezerType}
            onManageZones={() => setActiveTab('zones')}
          />
        )}

        {/* Tab 3: Manage Shelves & Compartments */}
        {activeTab === 'zones' && (
          <ManageShelves
            zones={zones}
            items={items}
            onAddZone={handleAddZone}
            onUpdateZone={handleUpdateZone}
            onDeleteZone={handleDeleteZone}
            onReorderZones={handleReorderZones}
            onResetZones={handleResetZones}
          />
        )}

        {/* Tab 4: Defrost & Meal Planner View */}
        {activeTab === 'defrost' && (
          <DefrostTracker
            items={items}
            zones={zones}
            onStartThaw={handleStartThaw}
            onFinishThaw={handleFinishThaw}
          />
        )}

        {/* Tab 5: Print & Backup View */}
        {activeTab === 'print' && (
          <PrintManifest
            items={items}
            zones={zones}
            onResetDemoData={handleResetDemoData}
            onImportItems={handleImportItems}
          />
        )}
      </main>

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        defaultZone={addModalDefaultZone}
        zones={zones}
      />

      {/* Freezer Guidelines & Tips Modal */}
      <FreezerTipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />

      {/* Google Search Grounded Food Advice Modal */}
      <GroundedAdviceModal
        isOpen={isAdviceModalOpen}
        onClose={() => setIsAdviceModalOpen(false)}
      />

      {/* Barcode & QR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        items={items}
        zones={zones}
        onUpdateQuantity={handleUpdateQuantity}
        onStartThaw={handleStartThaw}
        onAddNewScannedItem={handleAddNewScannedItem}
      />

      {/* Container Printable QR Code Modal */}
      <ContainerQrModal
        isOpen={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        item={qrModalItem}
        zone={qrModalItem ? zonesMap[qrModalItem.zone] : undefined}
      />
    </div>
  );
}
