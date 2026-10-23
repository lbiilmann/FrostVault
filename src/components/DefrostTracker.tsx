import React, { useState } from 'react';
import { FreezerItem, ZoneInfo } from '../types/inventory';
import { CATEGORIES, DEFAULT_ZONES, SAFE_DEFROST_GUIDELINES, getFreshnessStatus } from '../data/defaults';
import { Clock, Flame, CheckCircle2, ChefHat, Sparkles } from 'lucide-react';

interface DefrostTrackerProps {
  items: FreezerItem[];
  zones?: ZoneInfo[];
  onStartThaw: (item: FreezerItem) => void;
  onFinishThaw: (item: FreezerItem, markConsumed: boolean) => void;
}

export const DefrostTracker: React.FC<DefrostTrackerProps> = ({
  items,
  zones = DEFAULT_ZONES,
  onStartThaw,
  onFinishThaw,
}) => {
  const [selectedMealItems, setSelectedMealItems] = useState<string[]>([]);
  const [generatedMealIdea, setGeneratedMealIdea] = useState<string | null>(null);

  const zonesMap = zones.reduce((acc, z) => {
    acc[z.id] = z;
    return acc;
  }, {} as Record<string, ZoneInfo>);

  // Active items currently thawing
  const thawingItems = items.filter((item) => !!item.thawing);

  // Items to prioritize eating (urgent <= 7 days or expiring soon <= 30 days, or starred)
  const priorityItems = [...items]
    .map((item) => ({
      item,
      freshness: getFreshnessStatus(item.bestByDate),
    }))
    .filter(({ freshness, item }) => freshness.status !== 'good' || item.isStarred)
    .sort((a, b) => a.freshness.daysRemaining - b.freshness.daysRemaining);

  const toggleMealItemSelection = (id: string) => {
    if (selectedMealItems.includes(id)) {
      setSelectedMealItems(selectedMealItems.filter((i: string) => i !== id));
    } else {
      if (selectedMealItems.length < 4) {
        setSelectedMealItems([...selectedMealItems, id]);
      }
    }
  };

  const handleGenerateMealIdea = () => {
    const selected = items.filter((i) => selectedMealItems.includes(i.id));
    if (selected.length === 0) return;

    const names = selected.map((i) => i.name).join(' + ');
    let suggestion = '';

    const hasMeat = selected.some((i) => i.category === 'meat_poultry' || i.category === 'seafood');
    const hasVeg = selected.some((i) => i.category === 'vegetables_fruits');
    const hasSoupOrBroth = selected.some((i) => i.category === 'soups_stocks');
    const hasMeal = selected.some((i) => i.category === 'prepared_meals');
    const hasBread = selected.some((i) => i.category === 'baked_goods');

    if (hasMeal) {
      suggestion = `Varm langsomt op i et ildfast fad eller på en pande ved 160°C under låg/folie. Server med en sprød frisk salat eller lunet frossent brød for et nemt aftensmåltid uden madspild.`;
    } else if (hasMeat && hasSoupOrBroth && hasVeg) {
      suggestion = `Varmende simregryde / pande: Brun det optøede kød hurtigt af, hæld fonden ved og lad det simre. Tilsæt de frosne grøntsager de sidste 5-7 minutter, så de bevarer bid og farve.`;
    } else if (hasMeat && hasVeg) {
      suggestion = `Nem bradepanderet: Vend det optøede kød og de frosne grøntsager i olivenolie, hvidløg, paprika og salt. Bag ved 200°C varmluft i 20-25 minutter, til det er gyldent og mørt.`;
    } else if (hasBread && hasSoupOrBroth) {
      suggestion = `Klassisk bistromenu: Varm fonden op og smag til med friske urter og en skefuld cremefraiche. Rist surdejsbrødet direkte fra frost med smeltet smør og parmesan.`;
    } else {
      suggestion = `Tø langsomt op i køleskabet natten over. Kombinér med basisingredienser (løg, hvidløg, smør) og tilbered ved moderat varme for at bevare saft og smag.`;
    }

    setGeneratedMealIdea(`Aftensmadsforslag: ${names} — ${suggestion}`);
  };

  return (
    <div className="space-y-8">
      {/* Active Thawing Queue Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                I gang med optøning i køleskabet
              </h3>
              <p className="text-xs text-slate-500">
                Hold styr på mad der er taget ud, så det ikke bliver glemt i køleskabet
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {thawingItems.length} {thawingItems.length === 1 ? 'vare' : 'varer'} under optøning
          </span>
        </div>

        {thawingItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <Flame className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Ingen varer er i gang med optøning lige nu</p>
            <p className="text-xs text-slate-400 mt-1">
              Klik på "Optø" på en vare i fryseren, når du flytter den til køleskabet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thawingItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{CATEGORIES[item.category]?.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded font-medium">
                      I køleskab
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 bg-white/70 p-2 rounded border border-cyan-100">
                    Optøning igangsat. Anbefales tilberedt inden for 24-48 timer efter fuld optøning.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onFinishThaw(item, false)}
                    className="text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Annuller (bliv i fryseren)
                  </button>

                  <button
                    onClick={() => onFinishThaw(item, true)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tilberedt / Spist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Grid: "Use First" List & "Freezer Meal Matcher" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: "Use First" Priority Queue */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>"Brug først"-prioritering</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Varer der nærmer sig slutningen af deres optimale smagsperiode eller er stjernemarkeret
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-amber-700 font-medium">
              {priorityItems.length} varer i kø
            </span>
          </div>

          {priorityItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Alle varer i fryseren er i deres optimale holdbarhedsperiode! Ingen hastesager.
            </p>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {priorityItems.map(({ item, freshness }) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                      {item.isStarred && (
                        <span className="text-amber-500 text-xs" title="Stjernemarkeret">★</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{CATEGORIES[item.category]?.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {item.quantity} {item.unit}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{zonesMap[item.zone]?.name || item.zone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono tabular-nums block ${
                          freshness.status === 'urgent'
                            ? 'text-rose-600 font-bold'
                            : 'text-amber-600 font-semibold'
                        }`}
                      >
                        {freshness.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        inden {item.bestByDate}
                      </span>
                    </div>

                    {!item.thawing ? (
                      <button
                        onClick={() => onStartThaw(item)}
                        className="px-3 py-1.5 text-xs font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Flame className="w-3 h-3 text-cyan-700" />
                        <span>Optø</span>
                      </button>
                    ) : (
                      <span className="text-xs text-cyan-700 font-medium font-mono">Optør...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Meal Inspiration Matchmaker */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-cyan-700" />
                <h3 className="text-base font-bold text-slate-900">Aftensmads-Matcher</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Vælg 1 til 4 ingredienser fra fryseren for at få et lynhurtigt madforslag
              </p>
            </div>

            {/* Selectable item pill list */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = selectedMealItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMealItemSelection(item.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-medium'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                      {CATEGORIES[item.category]?.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="mt-4">
              <button
                onClick={handleGenerateMealIdea}
                disabled={selectedMealItems.length === 0}
                className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Find madidé til {selectedMealItems.length} valgte</span>
              </button>
            </div>

            {/* Generated Suggestion Card */}
            {generatedMealIdea && (
              <div className="mt-4 p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl text-xs text-cyan-950 leading-relaxed">
                <p>{generatedMealIdea}</p>
              </div>
            )}
          </div>

          {/* Fødevarestyrelsen råd */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block mb-1">
              Fødevarestyrelsens gyldne regel:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Tø aldrig kød op på køkkenbordet ved stuetemperatur. Bakterier trives mellem 10°C og 50°C. Optø altid langsomt i køleskabet eller i koldt vandbad.
            </p>
          </div>
        </div>
      </div>

      {/* Safe Thawing Methods Reference Grid */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Sikker optøningsguide (fra fryser til bord)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAFE_DEFROST_GUIDELINES.map((guide) => (
            <div key={guide.method} className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{guide.method}</h4>
                <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded font-medium">
                  {guide.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{guide.description}</p>
              <p className="text-[11px] text-amber-700 mt-2 font-medium">Bemærk: {guide.caution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
