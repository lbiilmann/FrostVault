export type CategoryId =
  | 'meat_poultry'
  | 'seafood'
  | 'prepared_meals'
  | 'vegetables_fruits'
  | 'soups_stocks'
  | 'baked_goods'
  | 'desserts_ice_cream'
  | 'ingredients_pantry';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  defaultMonths: number;
  description: string;
}

export type ZoneId = string;

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  suggestedUsage: string;
  maxRecommendedItems: number;
}

export type PackagingType =
  | 'frost_pose'
  | 'freezer_bag'
  | 'vacuum'
  | 'glass_container'
  | 'plastic_container'
  | 'foil_wrap';

export interface FreezerItem {
  id: string;
  name: string;
  category: CategoryId;
  quantity: number;
  unit: string;
  zone: ZoneId;
  frozenDate: string; // YYYY-MM-DD
  bestByDate: string; // YYYY-MM-DD
  packaging: PackagingType;
  notes?: string;
  isStarred?: boolean;
  thawing?: {
    startedAt: string; // ISO string
    targetHours: number;
    notes?: string;
  } | null;
  createdAt: string;
}

export interface FreezerPreset {
  name: string;
  category: CategoryId;
  defaultMonths: number;
  defaultUnit: string;
  suggestedZone: ZoneId;
}

export type FreezerType = 'upright' | 'chest' | 'bottom_freezer';
