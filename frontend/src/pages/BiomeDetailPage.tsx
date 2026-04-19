import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ── Per-biome colour palette ── */
interface BiomePalette {
  name: string;
  slug: string;
  bg: string;
  heroGradient: string;
  accent: string;
  accentLight: string;
  badge: string;
  border: string;
  cardBg: string;
  cardBorder: string;
  textMuted: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  image: string;
  description: string;
  facts: { icon: string; title: string; desc: string }[];
}

const BIOME_DATA: BiomePalette[] = [
  {
    name: 'Tropical Rainforest', slug: 'tropical-rainforest',
    bg: 'bg-green-950', heroGradient: 'from-green-950/70 via-emerald-950/80 to-green-950',
    accent: 'text-emerald-400', accentLight: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-900/30', cardBg: 'bg-green-900/40', cardBorder: 'border-emerald-900/30 hover:border-emerald-500/40',
    textMuted: 'text-emerald-300/50', tagBg: 'bg-emerald-500/20', tagBorder: 'border-emerald-500/30', tagText: 'text-emerald-300',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=800&fit=crop&q=70',
    description: 'Tropical rainforests are Earth\'s most biodiverse biome, home to over half of all terrestrial species despite covering only 6% of the planet\'s surface.',
    facts: [
      { icon: '🌿', title: 'Canopy Layers', desc: 'Rainforests have 4 distinct layers — emergent, canopy, understory, and forest floor.' },
      { icon: '💧', title: 'Rainfall', desc: 'Tropical rainforests receive 200–450 cm of rainfall per year.' },
      { icon: '🦜', title: 'Biodiversity', desc: 'A single hectare can contain 750 types of trees and 1,500 species of higher plants.' },
      { icon: '🌡️', title: 'Temperature', desc: 'Average temperature stays between 20–34 °C year-round.' },
      { icon: '🫁', title: 'Oxygen', desc: 'Rainforests produce roughly 28% of the world\'s oxygen.' },
      { icon: '🗺️', title: 'Coverage', desc: 'Found near the equator in Central & South America, Africa, and Southeast Asia.' },
    ],
  },
  {
    name: 'Temperate Forest', slug: 'temperate-forest',
    bg: 'bg-emerald-950', heroGradient: 'from-emerald-950/70 via-green-950/80 to-emerald-950',
    accent: 'text-green-400', accentLight: 'text-green-300', badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    border: 'border-green-900/30', cardBg: 'bg-emerald-900/40', cardBorder: 'border-green-900/30 hover:border-green-500/40',
    textMuted: 'text-green-300/50', tagBg: 'bg-green-500/20', tagBorder: 'border-green-500/30', tagText: 'text-green-300',
    image: 'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=1600&h=800&fit=crop&q=70',
    description: 'Temperate forests experience four distinct seasons and are characterised by deciduous and evergreen trees that create a rich, layered ecosystem.',
    facts: [
      { icon: '🍂', title: 'Seasons', desc: 'Four distinct seasons drive dramatic changes in foliage colour and animal behaviour.' },
      { icon: '🌳', title: 'Tree Types', desc: 'Dominated by oaks, maples, beeches, and mixed conifer species.' },
      { icon: '🦌', title: 'Wildlife', desc: 'Home to deer, bears, foxes, owls, and diverse bird species.' },
      { icon: '🌧️', title: 'Rainfall', desc: 'Annual precipitation ranges from 75–150 cm, well-distributed year-round.' },
      { icon: '🌡️', title: 'Temperature', desc: 'Ranges from −30 °C in winter to 30 °C in summer.' },
      { icon: '🗺️', title: 'Location', desc: 'Found in eastern North America, Europe, and eastern Asia.' },
    ],
  },
  {
    name: 'Boreal Forest', slug: 'boreal-forest',
    bg: 'bg-teal-950', heroGradient: 'from-teal-950/70 via-emerald-950/80 to-teal-950',
    accent: 'text-teal-400', accentLight: 'text-teal-300', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    border: 'border-teal-900/30', cardBg: 'bg-teal-900/40', cardBorder: 'border-teal-900/30 hover:border-teal-500/40',
    textMuted: 'text-teal-300/50', tagBg: 'bg-teal-500/20', tagBorder: 'border-teal-500/30', tagText: 'text-teal-300',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1600&h=800&fit=crop&q=70',
    description: 'The boreal forest (taiga) is the world\'s largest land biome, stretching across northern latitudes with vast conifer forests.',
    facts: [
      { icon: '🌲', title: 'Size', desc: 'The taiga covers 17 million km² — the largest terrestrial biome on Earth.' },
      { icon: '❄️', title: 'Winter', desc: 'Winters last 6–7 months with temperatures dropping below −40 °C.' },
      { icon: '🐺', title: 'Predators', desc: 'Home to wolves, lynx, wolverines, and brown bears.' },
      { icon: '🦌', title: 'Caribou', desc: 'Millions of caribou migrate through boreal forests annually.' },
      { icon: '🔥', title: 'Wildfire', desc: 'Natural fires are essential for the regeneration of boreal ecosystems.' },
      { icon: '🗺️', title: 'Span', desc: 'Stretches across Canada, Scandinavia, and Siberia.' },
    ],
  },
  {
    name: 'Savanna', slug: 'savanna',
    bg: 'bg-amber-950', heroGradient: 'from-amber-950/70 via-orange-950/80 to-amber-950',
    accent: 'text-amber-400', accentLight: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    border: 'border-amber-900/30', cardBg: 'bg-amber-900/40', cardBorder: 'border-amber-900/30 hover:border-amber-500/40',
    textMuted: 'text-amber-300/50', tagBg: 'bg-amber-500/20', tagBorder: 'border-amber-500/30', tagText: 'text-amber-300',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&h=800&fit=crop&q=70',
    description: 'Savannas are tropical grasslands with scattered trees, known for their vast herds of grazing animals and iconic predators.',
    facts: [
      { icon: '🦁', title: 'Big Five', desc: 'African savannas host the famous Big Five: lion, elephant, buffalo, leopard, and rhino.' },
      { icon: '🌾', title: 'Grasses', desc: 'Grasses can grow 1–2 m tall during the wet season.' },
      { icon: '🌧️', title: 'Seasons', desc: 'Distinct wet and dry seasons drive massive animal migrations.' },
      { icon: '🔥', title: 'Fire', desc: 'Regular fires prevent tree encroachment and maintain the grassland ecosystem.' },
      { icon: '🐘', title: 'Migration', desc: 'The Great Migration in the Serengeti involves 1.5 million wildebeest.' },
      { icon: '🗺️', title: 'Location', desc: 'Found in Africa, South America, India, and northern Australia.' },
    ],
  },
  {
    name: 'Grassland', slug: 'grassland',
    bg: 'bg-lime-950', heroGradient: 'from-lime-950/70 via-green-950/80 to-lime-950',
    accent: 'text-lime-400', accentLight: 'text-lime-300', badge: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    border: 'border-lime-900/30', cardBg: 'bg-lime-900/40', cardBorder: 'border-lime-900/30 hover:border-lime-500/40',
    textMuted: 'text-lime-300/50', tagBg: 'bg-lime-500/20', tagBorder: 'border-lime-500/30', tagText: 'text-lime-300',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=800&fit=crop&q=70',
    description: 'Grasslands are open landscapes dominated by grasses rather than shrubs or trees, supporting large herds and burrowing mammals.',
    facts: [
      { icon: '🌾', title: 'Grass Roots', desc: 'Grass roots can extend 2 m deep, making grasslands incredibly resilient.' },
      { icon: '🐎', title: 'Wild Horses', desc: 'Wild horse populations evolved on the steppes and prairies.' },
      { icon: '🦬', title: 'Bison', desc: 'Once 60 million bison roamed the North American prairies.' },
      { icon: '🌪️', title: 'Weather', desc: 'Grasslands experience extreme temperature swings and frequent storms.' },
      { icon: '🕳️', title: 'Burrowers', desc: 'Prairie dogs create vast underground tunnel systems called towns.' },
      { icon: '🗺️', title: 'Location', desc: 'Prairies (N. America), pampas (S. America), steppes (Eurasia).' },
    ],
  },
  {
    name: 'Desert', slug: 'desert',
    bg: 'bg-orange-950', heroGradient: 'from-orange-950/70 via-amber-950/80 to-orange-950',
    accent: 'text-orange-400', accentLight: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    border: 'border-orange-900/30', cardBg: 'bg-orange-900/40', cardBorder: 'border-orange-900/30 hover:border-orange-500/40',
    textMuted: 'text-orange-300/50', tagBg: 'bg-orange-500/20', tagBorder: 'border-orange-500/30', tagText: 'text-orange-300',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600&h=800&fit=crop&q=70',
    description: 'Deserts cover about one-third of the Earth\'s land surface. Despite extreme heat and scarce water, they harbour surprisingly diverse life.',
    facts: [
      { icon: '🌡️', title: 'Temperature', desc: 'Daytime temps can reach 55 °C; nights can drop below 0 °C.' },
      { icon: '🌵', title: 'Cacti', desc: 'Saguaro cacti can store up to 760 litres of water.' },
      { icon: '🦎', title: 'Reptiles', desc: 'Deserts are home to more reptile species than any other biome.' },
      { icon: '💧', title: 'Rainfall', desc: 'Most deserts receive less than 25 cm of rain per year.' },
      { icon: '🏜️', title: 'Sahara', desc: 'The Sahara is the world\'s largest hot desert at 9.2 million km².' },
      { icon: '🦂', title: 'Nocturnal Life', desc: 'Most desert animals are active at night to avoid extreme heat.' },
    ],
  },
  {
    name: 'Tundra', slug: 'tundra',
    bg: 'bg-sky-950', heroGradient: 'from-sky-950/70 via-blue-950/80 to-sky-950',
    accent: 'text-sky-400', accentLight: 'text-sky-300', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    border: 'border-sky-900/30', cardBg: 'bg-sky-900/40', cardBorder: 'border-sky-900/30 hover:border-sky-500/40',
    textMuted: 'text-sky-300/50', tagBg: 'bg-sky-500/20', tagBorder: 'border-sky-500/30', tagText: 'text-sky-300',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=800&fit=crop&q=70',
    description: 'The tundra is a treeless, frozen landscape where harsh conditions create a unique ecosystem of hardy, resilient species.',
    facts: [
      { icon: '❄️', title: 'Permafrost', desc: 'The ground is permanently frozen up to 450 m deep.' },
      { icon: '☀️', title: 'Midnight Sun', desc: 'Experiences 24 hours of daylight in summer and darkness in winter.' },
      { icon: '🦊', title: 'Arctic Fox', desc: 'Changes fur colour from brown in summer to white in winter.' },
      { icon: '🌱', title: 'Growing Season', desc: 'Plants have only 50–60 days to grow and reproduce.' },
      { icon: '🦌', title: 'Caribou', desc: 'Large caribou herds migrate up to 5,000 km annually.' },
      { icon: '🌡️', title: 'Cold', desc: 'Average winter temperature is −34 °C.' },
    ],
  },
  {
    name: 'Arctic Tundra', slug: 'arctic-tundra',
    bg: 'bg-blue-950', heroGradient: 'from-blue-950/70 via-indigo-950/80 to-blue-950',
    accent: 'text-blue-400', accentLight: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    border: 'border-blue-900/30', cardBg: 'bg-blue-900/40', cardBorder: 'border-blue-900/30 hover:border-blue-500/40',
    textMuted: 'text-blue-300/50', tagBg: 'bg-blue-500/20', tagBorder: 'border-blue-500/30', tagText: 'text-blue-300',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1600&h=800&fit=crop&q=70',
    description: 'The Arctic tundra encircles the North Pole, a permafrost landscape home to polar bears, musk oxen, and caribou.',
    facts: [
      { icon: '🐻‍❄️', title: 'Polar Bear', desc: 'The largest land carnivore, uniquely adapted to Arctic life.' },
      { icon: '🧊', title: 'Sea Ice', desc: 'Arctic sea ice has declined by 13% per decade since 1979.' },
      { icon: '🦅', title: 'Birds', desc: 'Millions of migratory birds breed in the Arctic each summer.' },
      { icon: '🫎', title: 'Musk Ox', desc: 'Qiviut — musk ox wool — is 8 times warmer than sheep wool.' },
      { icon: '🌿', title: 'Plants', desc: 'Over 1,700 species of plants thrive in the Arctic tundra.' },
      { icon: '🗺️', title: 'Area', desc: 'Covers about 5.5 million km² of the northern hemisphere.' },
    ],
  },
  {
    name: 'Ocean', slug: 'ocean',
    bg: 'bg-slate-950', heroGradient: 'from-slate-950/70 via-blue-950/80 to-slate-950',
    accent: 'text-blue-400', accentLight: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    border: 'border-blue-900/30', cardBg: 'bg-slate-900/40', cardBorder: 'border-blue-900/30 hover:border-blue-500/40',
    textMuted: 'text-blue-300/50', tagBg: 'bg-blue-500/20', tagBorder: 'border-blue-500/30', tagText: 'text-blue-300',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&h=800&fit=crop&q=70',
    description: 'The ocean covers 71% of Earth\'s surface and contains 97% of all water. It drives weather, produces oxygen, and harbours incredible biodiversity.',
    facts: [
      { icon: '🌊', title: 'Deepest Point', desc: 'The Mariana Trench reaches 10,994 m — deeper than Everest is tall.' },
      { icon: '💡', title: 'Bioluminescence', desc: 'About 76% of ocean creatures produce their own light.' },
      { icon: '🐋', title: 'Blue Whale', desc: 'The largest animal ever — up to 30 m and 200 tonnes.' },
      { icon: '🌡️', title: 'Deep Cold', desc: 'The average deep-ocean temperature is just 1–4 °C.' },
      { icon: '🔬', title: 'Undiscovered', desc: 'Over 80% of the ocean remains unexplored and unmapped.' },
      { icon: '🫧', title: 'Oxygen', desc: 'Oceans produce over 50% of the world\'s oxygen via phytoplankton.' },
    ],
  },
  {
    name: 'Freshwater', slug: 'freshwater',
    bg: 'bg-cyan-950', heroGradient: 'from-cyan-950/70 via-teal-950/80 to-cyan-950',
    accent: 'text-cyan-400', accentLight: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    border: 'border-cyan-900/30', cardBg: 'bg-cyan-900/40', cardBorder: 'border-cyan-900/30 hover:border-cyan-500/40',
    textMuted: 'text-cyan-300/50', tagBg: 'bg-cyan-500/20', tagBorder: 'border-cyan-500/30', tagText: 'text-cyan-300',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=800&fit=crop&q=70',
    description: 'Freshwater ecosystems — rivers, lakes, and streams — hold only 0.01% of the world\'s water but support 10% of all known species.',
    facts: [
      { icon: '🐟', title: 'Fish Diversity', desc: 'Over 15,000 freshwater fish species — 51% of all fish.' },
      { icon: '💧', title: 'Rare Resource', desc: 'Only 3% of Earth\'s water is fresh; most is locked in ice.' },
      { icon: '🦦', title: 'Otters', desc: 'River otters are indicator species for healthy watersheds.' },
      { icon: '🐊', title: 'Apex Predators', desc: 'Crocodiles and alligators have ruled freshwater for 200M years.' },
      { icon: '🏞️', title: 'Largest Lake', desc: 'Lake Baikal holds 20% of the world\'s unfrozen freshwater.' },
      { icon: '⚡', title: 'Electric Eel', desc: 'Can discharge up to 860 volts — enough to stun a horse.' },
    ],
  },
  {
    name: 'Coral Reef', slug: 'coral-reef',
    bg: 'bg-pink-950', heroGradient: 'from-pink-950/70 via-rose-950/80 to-pink-950',
    accent: 'text-pink-400', accentLight: 'text-pink-300', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    border: 'border-pink-900/30', cardBg: 'bg-pink-900/40', cardBorder: 'border-pink-900/30 hover:border-pink-500/40',
    textMuted: 'text-pink-300/50', tagBg: 'bg-pink-500/20', tagBorder: 'border-pink-500/30', tagText: 'text-pink-300',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1600&h=800&fit=crop&q=70',
    description: 'Coral reefs are the rainforests of the sea, covering less than 1% of the ocean floor yet supporting 25% of all marine species.',
    facts: [
      { icon: '🪸', title: 'Great Barrier', desc: 'Australia\'s Great Barrier Reef is visible from space — 2,300 km long.' },
      { icon: '🐠', title: 'Species', desc: 'A single reef can host over 1,000 species of fish.' },
      { icon: '🌡️', title: 'Bleaching', desc: 'Rising ocean temperatures cause mass coral bleaching events.' },
      { icon: '💎', title: 'Growth', desc: 'Coral grows just 0.3–2 cm per year — reefs take millennia to form.' },
      { icon: '🤝', title: 'Symbiosis', desc: 'Corals depend on symbiotic algae called zooxanthellae for food.' },
      { icon: '💊', title: 'Medicine', desc: 'Coral reef organisms are sources of compounds for cancer and pain drugs.' },
    ],
  },
  {
    name: 'Wetland', slug: 'wetland',
    bg: 'bg-emerald-950', heroGradient: 'from-emerald-950/70 via-teal-950/80 to-emerald-950',
    accent: 'text-emerald-400', accentLight: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-900/30', cardBg: 'bg-emerald-900/40', cardBorder: 'border-emerald-900/30 hover:border-emerald-500/40',
    textMuted: 'text-emerald-300/50', tagBg: 'bg-emerald-500/20', tagBorder: 'border-emerald-500/30', tagText: 'text-emerald-300',
    image: 'https://images.unsplash.com/photo-1562655147-20e498d1584e?w=1600&h=800&fit=crop&q=70',
    description: 'Wetlands are transitional zones between land and water — marshes, swamps, and bogs that act as nature\'s kidneys, filtering water and preventing floods.',
    facts: [
      { icon: '🐸', title: 'Amphibians', desc: 'Wetlands are the primary habitat for most amphibian species.' },
      { icon: '🪺', title: 'Bird Nurseries', desc: 'Over 900 bird species depend on wetlands for breeding.' },
      { icon: '🌊', title: 'Flood Control', desc: 'One hectare of wetland can store up to 15 million litres of water.' },
      { icon: '🌿', title: 'Carbon Sinks', desc: 'Peatlands store twice as much carbon as all the world\'s forests.' },
      { icon: '📉', title: 'Decline', desc: '64% of the world\'s wetlands have been lost since 1900.' },
      { icon: '🐊', title: 'Predators', desc: 'Home to crocodilians, herons, and large snapping turtles.' },
    ],
  },
  {
    name: 'Alpine', slug: 'alpine',
    bg: 'bg-slate-950', heroGradient: 'from-slate-950/70 via-gray-900/80 to-slate-950',
    accent: 'text-slate-400', accentLight: 'text-slate-300', badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    border: 'border-slate-700/30', cardBg: 'bg-slate-800/40', cardBorder: 'border-slate-700/30 hover:border-slate-500/40',
    textMuted: 'text-slate-400/60', tagBg: 'bg-slate-500/20', tagBorder: 'border-slate-500/30', tagText: 'text-slate-300',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=800&fit=crop&q=70',
    description: 'Alpine ecosystems exist above the tree line on mountains worldwide, where only the hardiest species survive extreme cold, UV radiation, and thin air.',
    facts: [
      { icon: '🏔️', title: 'Tree Line', desc: 'The alpine zone begins where trees can no longer grow — typically 2,000–3,500 m.' },
      { icon: '🐐', title: 'Mountain Goats', desc: 'Alpine ibex and mountain goats navigate near-vertical cliff faces.' },
      { icon: '🌸', title: 'Alpine Flowers', desc: 'Edelweiss and alpine gentian bloom briefly in the short summer.' },
      { icon: '🦅', title: 'Raptors', desc: 'Golden eagles and bearded vultures patrol alpine skies.' },
      { icon: '🌬️', title: 'Wind', desc: 'Alpine winds can exceed 150 km/h, shaping all life forms.' },
      { icon: '❄️', title: 'Snow', desc: 'Many alpine zones have snow cover for 8+ months per year.' },
    ],
  },
  {
    name: 'Tropical Forest', slug: 'tropical-forest',
    bg: 'bg-green-950', heroGradient: 'from-green-950/70 via-emerald-950/80 to-green-950',
    accent: 'text-green-400', accentLight: 'text-green-300', badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    border: 'border-green-900/30', cardBg: 'bg-green-900/40', cardBorder: 'border-green-900/30 hover:border-green-500/40',
    textMuted: 'text-green-300/50', tagBg: 'bg-green-500/20', tagBorder: 'border-green-500/30', tagText: 'text-green-300',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=800&fit=crop&q=70',
    description: 'Tropical forests with seasonal rainfall patterns support diverse ecosystems, including dry deciduous forests and monsoon forests.',
    facts: [
      { icon: '🌴', title: 'Seasonal', desc: 'Unlike rainforests, tropical forests have a pronounced dry season.' },
      { icon: '🐒', title: 'Primates', desc: 'Home to many primate species, from howler monkeys to lemurs.' },
      { icon: '🌺', title: 'Flowers', desc: 'Many trees flower during the dry season when pollinators are most active.' },
      { icon: '🪵', title: 'Hardwoods', desc: 'Teak and mahogany are prized tropical forest hardwoods.' },
      { icon: '🦎', title: 'Reptiles', desc: 'Tropical forests harbour hundreds of reptile and amphibian species.' },
      { icon: '🗺️', title: 'Range', desc: 'Found in Central America, South and Southeast Asia, and Africa.' },
    ],
  },
  {
    name: 'Tropical Savanna', slug: 'tropical-savanna',
    bg: 'bg-yellow-950', heroGradient: 'from-yellow-950/70 via-amber-950/80 to-yellow-950',
    accent: 'text-yellow-400', accentLight: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    border: 'border-yellow-900/30', cardBg: 'bg-yellow-900/40', cardBorder: 'border-yellow-900/30 hover:border-yellow-500/40',
    textMuted: 'text-yellow-300/50', tagBg: 'bg-yellow-500/20', tagBorder: 'border-yellow-500/30', tagText: 'text-yellow-300',
    image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&h=800&fit=crop&q=70',
    description: 'Tropical savannas feature warm temperatures year-round with a distinct wet and dry season, creating a mosaic of grasslands and woodland.',
    facts: [
      { icon: '☀️', title: 'Warm', desc: 'Average temperature stays above 18 °C year-round.' },
      { icon: '🌧️', title: 'Wet Season', desc: 'Receives 50–130 cm of rain, mostly during a 4–6 month wet season.' },
      { icon: '🐃', title: 'Grazers', desc: 'Supports large populations of ungulates and their predators.' },
      { icon: '🌳', title: 'Scattered Trees', desc: 'Open canopy of fire-resistant trees like baobabs and acacias.' },
      { icon: '🦗', title: 'Insects', desc: 'Termite mounds dot the landscape — some over 5 m tall.' },
      { icon: '🗺️', title: 'Location', desc: 'Covers much of Sub-Saharan Africa, northern Australia, and Brazil.' },
    ],
  },
  {
    name: 'Antarctic', slug: 'antarctic',
    bg: 'bg-indigo-950', heroGradient: 'from-indigo-950/70 via-blue-950/80 to-indigo-950',
    accent: 'text-indigo-400', accentLight: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    border: 'border-indigo-900/30', cardBg: 'bg-indigo-900/40', cardBorder: 'border-indigo-900/30 hover:border-indigo-500/40',
    textMuted: 'text-indigo-300/50', tagBg: 'bg-indigo-500/20', tagBorder: 'border-indigo-500/30', tagText: 'text-indigo-300',
    image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1600&h=800&fit=crop&q=70',
    description: 'Antarctica is Earth\'s coldest, driest, and windiest continent. Despite extreme conditions, its surrounding waters teem with marine life.',
    facts: [
      { icon: '🐧', title: 'Penguins', desc: 'Home to Emperor, Adélie, Chinstrap, and Gentoo penguins.' },
      { icon: '🌡️', title: 'Coldest', desc: 'Recorded the lowest temperature on Earth: −89.2 °C.' },
      { icon: '🐋', title: 'Whales', desc: 'Antarctic waters host humpback, blue, and orca whales.' },
      { icon: '🧊', title: 'Ice Sheet', desc: 'Contains 26.5 million km³ of ice — 90% of Earth\'s ice.' },
      { icon: '🦐', title: 'Krill', desc: 'Antarctic krill biomass exceeds 500 million tonnes — the food chain\'s foundation.' },
      { icon: '🌞', title: 'Daylight', desc: 'Experiences 6 months of continuous daylight and 6 months of darkness.' },
    ],
  },
  {
    name: 'Arid Shrubland', slug: 'arid-shrubland',
    bg: 'bg-yellow-950', heroGradient: 'from-yellow-950/70 via-orange-950/80 to-yellow-950',
    accent: 'text-yellow-500', accentLight: 'text-yellow-300', badge: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
    border: 'border-yellow-900/30', cardBg: 'bg-yellow-900/40', cardBorder: 'border-yellow-900/30 hover:border-yellow-500/40',
    textMuted: 'text-yellow-300/50', tagBg: 'bg-yellow-600/20', tagBorder: 'border-yellow-600/30', tagText: 'text-yellow-300',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&h=800&fit=crop&q=70',
    description: 'Arid shrublands are semi-arid regions with scattered drought-resistant shrubs and bushes, bridging the gap between deserts and grasslands.',
    facts: [
      { icon: '🌿', title: 'Vegetation', desc: 'Dominated by drought-resistant shrubs, succulents, and small trees.' },
      { icon: '🦎', title: 'Reptiles', desc: 'Home to diverse lizard, snake, and tortoise populations.' },
      { icon: '💧', title: 'Rainfall', desc: 'Annual rainfall of 25–50 cm — more than desert, less than grassland.' },
      { icon: '🔥', title: 'Fire-Adapted', desc: 'Many shrubland plants resprout rapidly after fire.' },
      { icon: '🌸', title: 'Super Bloom', desc: 'After rare heavy rains, these landscapes explode with wildflowers.' },
      { icon: '🗺️', title: 'Examples', desc: 'Mediterranean chaparral, South African fynbos, Australian scrubland.' },
    ],
  },
];

function getBiomeBySlug(slug: string): BiomePalette | undefined {
  return BIOME_DATA.find(b => b.slug === slug);
}

export { BIOME_DATA };

export default function BiomeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const biome = getBiomeBySlug(slug || '');

  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!biome) return;
    getAnimals({ page: 1, size: 500, biome: biome.name, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [biome]);

  const classCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => {
      const c = a.class_name || 'Unknown';
      m[c] = (m[c] || 0) + 1;
    });
    return m;
  }, [animals]);

  const sortedClasses = useMemo(
    () => Object.entries(classCounts).sort((a, b) => b[1] - a[1]),
    [classCounts],
  );

  if (!biome) {
    return (
      <div className="bg-forest-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🌍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Biome Not Found</h1>
          <Link to="/biomes" className="text-emerald-400 hover:text-emerald-300 font-medium">
            ← Back to Biomes
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${biome.bg} min-h-screen`}>
        <div className="h-[480px] bg-black/30" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${biome.bg} min-h-screen`}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={biome.image} alt="" className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-b ${biome.heroGradient}`} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <Link
            to="/biomes"
            className={`inline-flex items-center gap-2 ${biome.badge} px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Biomes
          </Link>

          <p className={`${biome.textMuted} text-lg mb-2 animate-fade-in`}>Discover the</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4 animate-fade-in-up">
            {biome.name}
          </h1>
          <p className={`${biome.textMuted} text-lg max-w-2xl mx-auto mb-10 animate-fade-in`} style={{ animationDelay: '150ms' }}>
            {biome.description}
          </p>

          <div className="flex justify-center gap-10 md:gap-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div>
              <div className={`text-4xl font-bold ${biome.accent} font-display`}>{animals.length}</div>
              <div className={`text-[10px] ${biome.textMuted} uppercase tracking-wider font-bold mt-1`}>Species</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${biome.accentLight} font-display`}>{Object.keys(classCounts).length}</div>
              <div className={`text-[10px] ${biome.textMuted} uppercase tracking-wider font-bold mt-1`}>Animal Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Animals by class ── */}
      <div className="w-full px-6 lg:px-12 py-12">
        <p className={`${biome.accent} text-sm font-bold uppercase tracking-widest mb-3 text-center animate-fade-in`}>Explore by Class</p>
        <h2 className="font-display text-3xl font-bold text-white mb-8 text-center animate-fade-in-up">{biome.name} Species</h2>

        {sortedClasses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌍</p>
            <p className={`text-lg font-medium ${biome.textMuted}`}>No species found in this biome yet</p>
          </div>
        )}

        {sortedClasses.map(([className, count]) => {
          const classAnimals = animals.filter(a => (a.class_name || 'Unknown') === className);
          return (
            <div key={className} className="mb-12 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <h3 className="font-display text-xl font-bold text-white">{className}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${biome.tagBg} ${biome.tagText} border ${biome.tagBorder}`}>
                  {count}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[160px] sm:auto-rows-[200px]">
                {classAnimals.map((animal, i) => {
                  const isTall = (i % 5 === 0) || (i % 5 === 3);
                  return (
                    <Link
                      key={animal.slug}
                      to={`/animal/${animal.slug}`}
                      className={`group relative rounded-xl overflow-hidden block ${isTall ? 'row-span-2' : ''}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <img
                        src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                        alt={animal.common_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />
                      {animal.conservation_status && (
                        <div className="absolute top-2 right-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(animal.conservation_status.code)}`}>
                            {animal.conservation_status.code}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className={`text-white font-bold ${isTall ? 'text-base' : 'text-sm'}`}>{animal.common_name}</h4>
                        <p className={`${biome.textMuted} text-xs italic truncate`}>{animal.scientific_name}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Facts footer ── */}
      <div className={`border-t ${biome.border}`}>
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">{biome.name} Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {biome.facts.map(fact => (
              <div
                key={fact.title}
                className={`${biome.cardBg} border ${biome.border} rounded-xl p-5 hover:border-white/20 transition`}
              >
                <div className="text-2xl mb-3">{fact.icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">{fact.title}</h3>
                <p className={`${biome.textMuted} text-sm`}>{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
