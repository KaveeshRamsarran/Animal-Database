export interface ConservationStatus {
  id: number;
  code: string;
  name: string;
  description?: string;
  severity: number;
}

export interface ContinentOut {
  id: number;
  name: string;
  code: string;
  description?: string;
  image_url?: string;
}

export interface CountryBrief {
  id: number;
  name: string;
  code: string;
}

export interface CountryOut {
  id: number;
  name: string;
  code: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  flag_url?: string;
  wildlife_overview?: string;
  continent_name?: string;
}

export interface ImageOut {
  id: number;
  url: string;
  alt_text?: string;
  source?: string;
  is_hero: boolean;
}

export interface FactOut {
  id: number;
  content: string;
  source?: string;
}

export interface BehaviorDetail {
  category: string;
  label: string;
  detail?: string;
}

export interface AnimalCard {
  id: number;
  slug: string;
  common_name: string;
  scientific_name?: string;
  class_name?: string;
  thumbnail_url?: string;
  hero_image_url?: string;
  conservation_status?: ConservationStatus;
  diet?: string;
  habitat_summary?: string;
  environment_type?: string;
  biome?: string;
  behavior_summary?: string;
  observation_count: number;
}

export interface AnimalDetail extends AnimalCard {
  alternate_names?: string;
  kingdom?: string;
  phylum?: string;
  order_name?: string;
  family_name?: string;
  genus?: string;
  species?: string;
  description?: string;
  diet_detail?: string;
  lifespan?: string;
  average_weight?: string;
  average_length?: string;
  behavior_summary?: string;
  reproduction?: string;
  predators?: string;
  prey?: string;
  social_structure?: string;
  activity_period?: string;
  migration_behavior?: string;
  communication?: string;
  ecological_role?: string;
  fun_facts?: string;
  wiki_summary?: string;
  is_domesticated: boolean;
  created_at?: string;
  updated_at?: string;
  continent?: ContinentOut;
  countries: CountryBrief[];
  images: ImageOut[];
  facts: FactOut[];
  behaviors: BehaviorDetail[];
}

export interface AnimalCompare {
  id: number;
  slug: string;
  common_name: string;
  scientific_name?: string;
  class_name?: string;
  order_name?: string;
  family_name?: string;
  diet?: string;
  lifespan?: string;
  average_weight?: string;
  average_length?: string;
  habitat_summary?: string;
  behavior_summary?: string;
  conservation_status?: ConservationStatus;
  hero_image_url?: string;
  environment_type?: string;
  countries: CountryBrief[];
  behaviors: BehaviorDetail[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface HotspotOut {
  id: number;
  animal_id: number;
  animal_name: string;
  animal_slug: string;
  thumbnail_url?: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  observation_count: number;
  conservation_status_code?: string;
}

export interface DistributionPoint {
  latitude: number;
  longitude: number;
  observation_count: number;
  country_code?: string;
}

export interface FavoriteOut {
  id: number;
  animal_id: number;
  animal_slug?: string;
  animal_name?: string;
  animal_thumbnail?: string;
  created_at?: string;
}

export interface UserOut {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface SyncJobOut {
  id: number;
  job_type: string;
  status: string;
  result_message?: string;
  items_processed: number;
  started_at?: string;
  finished_at?: string;
}

export interface StatsOut {
  total_animals: number;
  total_countries: number;
  total_occurrences: number;
  total_images: number;
  total_users: number;
  last_sync?: string;
}

export interface BehaviorOut {
  id: number;
  category: string;
  label: string;
  description?: string;
}
