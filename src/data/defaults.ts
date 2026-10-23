import { CategoryId, CategoryInfo, FreezerItem, FreezerPreset, PackagingType, ZoneId, ZoneInfo } from '../types/inventory';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  meat_poultry: {
    id: 'meat_poultry',
    label: 'Kød & Fjerkræ',
    defaultMonths: 6,
    description: 'Bøffer, stege, kyllingestykker, hakket kød, pølser',
  },
  seafood: {
    id: 'seafood',
    label: 'Fisk & Skaldyr',
    defaultMonths: 4,
    description: 'Laks, torsk, rødspætte, rejer, kammuslinger',
  },
  prepared_meals: {
    id: 'prepared_meals',
    label: 'Færdigretter & Rester',
    defaultMonths: 3,
    description: 'Lasagne, gryderetter, kødsovs, karryretter',
  },
  vegetables_fruits: {
    id: 'vegetables_fruits',
    label: 'Grøntsager & Bær',
    defaultMonths: 10,
    description: 'Frosne bær, ærter, majs, bønner, blancherede grøntsager',
  },
  soups_stocks: {
    id: 'soups_stocks',
    label: 'Supper & Fond',
    defaultMonths: 4,
    description: 'Hønsefond, oksefond, grøntsagssupper, saucer',
  },
  baked_goods: {
    id: 'baked_goods',
    label: 'Brød & Bagværk',
    defaultMonths: 3,
    description: 'Rugbrød i skiver, surdejsbrød, burgerboller, kagedej',
  },
  desserts_ice_cream: {
    id: 'desserts_ice_cream',
    label: 'Desserter & Is',
    defaultMonths: 2,
    description: 'Flødeis, sorbet, ispinde, tærtebunde',
  },
  ingredients_pantry: {
    id: 'ingredients_pantry',
    label: 'Ingredienser & Smør',
    defaultMonths: 6,
    description: 'Smør, hakkede krydderurter, ingefær, nødder, gær',
  },
};

export const DEFAULT_ZONES: ZoneInfo[] = [
  {
    id: 'top_shelf',
    name: 'Øverste hylde',
    suggestedUsage: 'Is, brød, færdigretter og varer du bruger tit',
    maxRecommendedItems: 12,
  },
  {
    id: 'middle_shelf',
    name: 'Midterste hylde',
    suggestedUsage: 'Hjemmelavede supper, kødsovs, rester og grønt',
    maxRecommendedItems: 14,
  },
  {
    id: 'bottom_drawer',
    name: 'Nederste dybe skuffe',
    suggestedUsage: 'Tungt kød, stege, hele fjerkræ og vakuumpakket kød',
    maxRecommendedItems: 16,
  },
  {
    id: 'door_bins',
    name: 'Lågehylder',
    suggestedUsage: 'Smør, gær, krydderurter, nødder og køleelementer',
    maxRecommendedItems: 10,
  },
  {
    id: 'fast_freeze',
    name: 'Indfrysningsbakke / Hurtigfrys',
    suggestedUsage: 'Bær spredt på bagepapir, småkagedej, flade pakker',
    maxRecommendedItems: 8,
  },
];

export const ZONES: Record<string, ZoneInfo> = DEFAULT_ZONES.reduce((acc, z) => {
  acc[z.id] = z;
  return acc;
}, {} as Record<string, ZoneInfo>);

export const PACKAGING_LABELS: Record<PackagingType, string> = {
  frost_pose: 'Frostpose',
  freezer_bag: 'Lynlåspose / Zip-pose',
  vacuum: 'Vakuumpakket',
  plastic_container: 'Plastikbøtte / Bøtte med låg',
  glass_container: 'Fryseegnet glasbeholder',
  foil_wrap: 'Frysefolie & Slagterpapir',
};

export const COMMON_PRESETS: FreezerPreset[] = [
  { name: 'Hakket oksekød (8-12%)', category: 'meat_poultry', defaultMonths: 4, defaultUnit: 'pk. (500g)', suggestedZone: 'bottom_drawer' },
  { name: 'Kyllingeoverlår (udbenede)', category: 'meat_poultry', defaultMonths: 9, defaultUnit: 'pk.', suggestedZone: 'bottom_drawer' },
  { name: 'Lakseportioner (skindside)', category: 'seafood', defaultMonths: 3, defaultUnit: 'portioner', suggestedZone: 'middle_shelf' },
  { name: 'Grønlandske rejer', category: 'seafood', defaultMonths: 6, defaultUnit: 'poser', suggestedZone: 'bottom_drawer' },
  { name: 'Hjemmelavet Bolognese kødsovs', category: 'prepared_meals', defaultMonths: 3, defaultUnit: 'bøtter (500ml)', suggestedZone: 'middle_shelf' },
  { name: 'Oksekødsgryde / Gullasch', category: 'prepared_meals', defaultMonths: 3, defaultUnit: 'portioner', suggestedZone: 'middle_shelf' },
  { name: 'Kraftig hønsefond', category: 'soups_stocks', defaultMonths: 6, defaultUnit: 'glas', suggestedZone: 'middle_shelf' },
  { name: 'Danske haveblåbær', category: 'vegetables_fruits', defaultMonths: 12, defaultUnit: 'poser', suggestedZone: 'top_shelf' },
  { name: 'Fine grønne ærter', category: 'vegetables_fruits', defaultMonths: 10, defaultUnit: 'poser', suggestedZone: 'middle_shelf' },
  { name: 'Rugbrød (i skiver)', category: 'baked_goods', defaultMonths: 3, defaultUnit: 'pakker', suggestedZone: 'top_shelf' },
  { name: 'Surdejsbrød (i skiver)', category: 'baked_goods', defaultMonths: 3, defaultUnit: 'brød', suggestedZone: 'top_shelf' },
  { name: 'Brioche burgerboller', category: 'baked_goods', defaultMonths: 3, defaultUnit: 'pk. (4 stk)', suggestedZone: 'top_shelf' },
  { name: 'Chokoladekagedej (i kugler)', category: 'baked_goods', defaultMonths: 3, defaultUnit: 'kugler', suggestedZone: 'fast_freeze' },
  { name: 'Lurpak saltet smør', category: 'ingredients_pantry', defaultMonths: 9, defaultUnit: 'pakker (200g)', suggestedZone: 'door_bins' },
  { name: 'Vaniljeis (ægte bourbon)', category: 'desserts_ice_cream', defaultMonths: 2, defaultUnit: 'bægre', suggestedZone: 'top_shelf' },
];

export const INITIAL_FREEZER_ITEMS: FreezerItem[] = [
  {
    id: 'item-1',
    name: 'Hjemmelavet Bolognese kødsovs',
    category: 'prepared_meals',
    quantity: 3,
    unit: 'bøtter (500ml)',
    zone: 'middle_shelf',
    frozenDate: '2026-08-15',
    bestByDate: '2026-11-15',
    packaging: 'glass_container',
    notes: 'Simret 4 timer med oksekød, svinekød og San Marzano tomater.',
    isStarred: true,
    thawing: null,
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'item-2',
    name: 'Friske lakseportioner',
    category: 'seafood',
    quantity: 4,
    unit: 'stk.',
    zone: 'bottom_drawer',
    frozenDate: '2026-09-02',
    bestByDate: '2026-12-02',
    packaging: 'vacuum',
    notes: 'Med skind. Tøes op 10-12 timer i køleskab før pandestegning.',
    isStarred: true,
    thawing: null,
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'item-3',
    name: 'Danske økologiske haveblåbær',
    category: 'vegetables_fruits',
    quantity: 2,
    unit: 'store poser',
    zone: 'top_shelf',
    frozenDate: '2026-07-20',
    bestByDate: '2027-07-20',
    packaging: 'freezer_bag',
    notes: 'Fra sommerens høst. Perfekt til havregrød, pandekager og smoothies.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-07-20T08:15:00Z',
  },
  {
    id: 'item-4',
    name: 'Mør oksegryde med rødvin',
    category: 'prepared_meals',
    quantity: 2,
    unit: 'portioner',
    zone: 'middle_shelf',
    frozenDate: '2026-08-01',
    bestByDate: '2026-10-28', // Nærmer sig (7 dage tilbage)
    packaging: 'glass_container',
    notes: 'Oksebov med gulerødder og svampe. Bør spises snart for optimal smag!',
    isStarred: true,
    thawing: null,
    createdAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'item-5',
    name: 'Kyllingeoverlår (uden ben)',
    category: 'meat_poultry',
    quantity: 3,
    unit: 'pakker (ca. 700g)',
    zone: 'bottom_drawer',
    frozenDate: '2026-08-25',
    bestByDate: '2027-05-25',
    packaging: 'vacuum',
    notes: 'Klar til karryret, wok eller ovnbagning med rodfrugter.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-08-25T16:00:00Z',
  },
  {
    id: 'item-6',
    name: 'Surdejsbrød (skiveskåret)',
    category: 'baked_goods',
    quantity: 1,
    unit: 'helt brød',
    zone: 'top_shelf',
    frozenDate: '2026-09-28',
    bestByDate: '2026-12-28',
    packaging: 'freezer_bag',
    notes: 'Skiverne kan kommes direkte i brødristeren fra frost.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-09-28T09:00:00Z',
  },
  {
    id: 'item-7',
    name: 'Gylden hønsefond (langtidsimret)',
    category: 'soups_stocks',
    quantity: 4,
    unit: 'glas (0,5 liter)',
    zone: 'middle_shelf',
    frozenDate: '2026-07-10',
    bestByDate: '2027-01-10',
    packaging: 'glass_container',
    notes: 'Efterladt 2-3 cm luft foroven i glasset så glasset ikke sprænger under frost.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-07-10T11:20:00Z',
  },
  {
    id: 'item-8',
    name: 'Lurpak saltet smør',
    category: 'ingredients_pantry',
    quantity: 3,
    unit: 'pakker (200g)',
    zone: 'door_bins',
    frozenDate: '2026-06-12',
    bestByDate: '2027-03-12',
    packaging: 'foil_wrap',
    notes: 'Købt på tilbud. Holder friskheden og smagen fremragende i fryseren.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-06-12T15:45:00Z',
  },
  {
    id: 'item-9',
    name: 'Fine ekstra søde ærter',
    category: 'vegetables_fruits',
    quantity: 1,
    unit: 'pose (800g)',
    zone: 'middle_shelf',
    frozenDate: '2026-09-10',
    bestByDate: '2027-07-10',
    packaging: 'freezer_bag',
    notes: 'Perfekt som hurtigt tilbehør, i risotto eller supper.',
    isStarred: false,
    thawing: null,
    createdAt: '2026-09-10T18:00:00Z',
  },
  {
    id: 'item-10',
    name: 'Chokoladekagedej (kugler)',
    category: 'baked_goods',
    quantity: 14,
    unit: 'kugler',
    zone: 'fast_freeze',
    frozenDate: '2026-09-15',
    bestByDate: '2026-12-15',
    packaging: 'freezer_bag',
    notes: 'Bages direkte fra frost ved 175°C i 13-14 minutter.',
    isStarred: true,
    thawing: null,
    createdAt: '2026-09-15T19:30:00Z',
  },
];

export function getDaysRemaining(targetDateStr: string, currentDate = '2026-10-21'): number {
  const target = new Date(targetDateStr).getTime();
  const current = new Date(currentDate).getTime();
  const diffMs = target - current;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getFreshnessStatus(bestByDate: string, currentDate = '2026-10-21'): {
  status: 'good' | 'expiring_soon' | 'urgent' | 'expired';
  daysRemaining: number;
  label: string;
} {
  const days = getDaysRemaining(bestByDate, currentDate);
  if (days < 0) {
    return { status: 'expired', daysRemaining: days, label: `${Math.abs(days)}d over anbefalet tid` };
  }
  if (days <= 7) {
    return { status: 'urgent', daysRemaining: days, label: `Brug om ${days}d (Haster)` };
  }
  if (days <= 30) {
    return { status: 'expiring_soon', daysRemaining: days, label: `Brug om ${days}d` };
  }
  const months = Math.round(days / 30);
  return { status: 'good', daysRemaining: days, label: `Optimal (~${months} mdr. tilbage)` };
}

export function addMonthsToDate(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export const SAFE_DEFROST_GUIDELINES = [
  {
    method: 'Optøning i køleskab (Bedst & sikrest)',
    time: '8 - 24 timer',
    description: 'Langsom og skånsom optøning bevarer kødets saft og struktur. Optøet kød holder sig fint i køleskabet i 1-2 dage bagefter.',
    caution: 'Læg pakken på en dyb tallerken på nederste hylde for at opsamle kondens og dryp.',
  },
  {
    method: 'Koldt vandbad (Hurtigere)',
    time: '30 min - 2 timer',
    description: 'Læg den tætte frysepose i koldt vand fra hanen. Skift vandet hver halve time så det forbliver koldt.',
    caution: 'Skal tilberedes straks efter optøning. Brug aldrig varmt vand!',
  },
  {
    method: 'Mikrobølgeovn (Lige før madlavning)',
    time: '5 - 10 minutter',
    description: 'Brug mikroovnens optøningsfunktion (30% effekt) og vend kødet undervejs for jævn optøning.',
    caution: 'Tilbered maden med det samme, da kanterne allerede kan være delvist tilberedte.',
  },
];
