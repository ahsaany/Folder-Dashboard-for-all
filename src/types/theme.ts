export type ThemeId = 
  | 'combo-royal'
  | 'combo-gold-brown'
  | 'combo-emerald-gold'
  | 'single-green'
  | 'single-gold'
  | 'single-brown'
  | 'single-white';

export interface PortalTheme {
  id: ThemeId;
  name: string;
  category: 'combination' | 'single';
  description: string;
  swatches: string[]; // 2-4 colors representing the theme
  primaryColor: string;
  accentColor: string;
  bannerGradient: string;
  bannerBorder: string;
  heroBadge: string;
  heroButton: string;
  headerAccent: string;
  activeTab: string;
  cardAccentBorder: string;
}

export const PORTAL_THEMES: Record<ThemeId, PortalTheme> = {
  'combo-royal': {
    id: 'combo-royal',
    name: 'Royal Signature (Green + Gold + Brown + White)',
    category: 'combination',
    description: 'Nada International School flagship combination blending Emerald Green, Rich Gold, Coffee Brown, and Crisp White.',
    swatches: ['#1B5E20', '#D4AF37', '#5D4037', '#FFFFFF'],
    primaryColor: '#1B5E20',
    accentColor: '#D4AF37',
    bannerGradient: 'from-[#1B5E20] via-[#2E7D32] to-[#5D4037]',
    bannerBorder: 'border-amber-400/30',
    heroBadge: 'bg-emerald-950/70 text-amber-300 border-amber-400/40',
    heroButton: 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md',
    headerAccent: 'text-emerald-800',
    activeTab: 'bg-emerald-800 text-white shadow-xs',
    cardAccentBorder: 'hover:border-amber-400',
  },
  'combo-gold-brown': {
    id: 'combo-gold-brown',
    name: 'Golden Majesty (Brown + Gold + White)',
    category: 'combination',
    description: 'Warm, prestigious blend of Saddle Brown, Desert Gold, and Crisp Pure White.',
    swatches: ['#4E342E', '#D4AF37', '#FFFFFF'],
    primaryColor: '#4E342E',
    accentColor: '#D4AF37',
    bannerGradient: 'from-[#3E2723] via-[#4E342E] to-[#6D4C41]',
    bannerBorder: 'border-amber-400/30',
    heroBadge: 'bg-amber-950/70 text-amber-300 border-amber-400/40',
    heroButton: 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md',
    headerAccent: 'text-[#4E342E]',
    activeTab: 'bg-[#4E342E] text-white shadow-xs',
    cardAccentBorder: 'hover:border-amber-500',
  },
  'combo-emerald-gold': {
    id: 'combo-emerald-gold',
    name: 'Emerald & Gold (Green + Gold + White)',
    category: 'combination',
    description: 'Classic accreditation palette with lush deep green, vivid golden highlights, and crisp surfaces.',
    swatches: ['#1B5E20', '#FFC107', '#FFFFFF'],
    primaryColor: '#1B5E20',
    accentColor: '#FFC107',
    bannerGradient: 'from-[#0B3D11] via-[#1B5E20] to-[#15803D]',
    bannerBorder: 'border-amber-400/40',
    heroBadge: 'bg-emerald-950/80 text-amber-300 border-amber-400/50',
    heroButton: 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md',
    headerAccent: 'text-emerald-800',
    activeTab: 'bg-emerald-800 text-white shadow-xs',
    cardAccentBorder: 'hover:border-emerald-500',
  },
  'single-green': {
    id: 'single-green',
    name: 'Forest Emerald Green',
    category: 'single',
    description: 'Dedicated emerald and forest green theme representing growth, knowledge, and prestige.',
    swatches: ['#1B5E20', '#2E7D32', '#A7F3D0'],
    primaryColor: '#1B5E20',
    accentColor: '#4ADE80',
    bannerGradient: 'from-[#064E3B] via-[#047857] to-[#059669]',
    bannerBorder: 'border-emerald-500/30',
    heroBadge: 'bg-emerald-950/60 text-emerald-200 border-emerald-400/40',
    heroButton: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-md',
    headerAccent: 'text-emerald-800',
    activeTab: 'bg-emerald-800 text-white shadow-xs',
    cardAccentBorder: 'hover:border-emerald-400',
  },
  'single-gold': {
    id: 'single-gold',
    name: 'Imperial Golden Amber',
    category: 'single',
    description: 'Radiant golden theme celebrating educational excellence and Cognia accreditation standards.',
    swatches: ['#B8860B', '#F59E0B', '#FEF3C7'],
    primaryColor: '#B8860B',
    accentColor: '#F59E0B',
    bannerGradient: 'from-[#78350F] via-[#B45309] to-[#D97706]',
    bannerBorder: 'border-amber-300/40',
    heroBadge: 'bg-amber-950/70 text-amber-200 border-amber-400/40',
    heroButton: 'bg-white hover:bg-amber-50 text-amber-950 font-bold shadow-md',
    headerAccent: 'text-amber-800',
    activeTab: 'bg-amber-700 text-white shadow-xs',
    cardAccentBorder: 'hover:border-amber-500',
  },
  'single-brown': {
    id: 'single-brown',
    name: 'Warm Saddle Brown',
    category: 'single',
    description: 'Earthy, authoritative warm brown and mahogany tones for a grounded, executive portal atmosphere.',
    swatches: ['#4E342E', '#6D4C41', '#D7CCC8'],
    primaryColor: '#4E342E',
    accentColor: '#A1887F',
    bannerGradient: 'from-[#271815] via-[#4E342E] to-[#5D4037]',
    bannerBorder: 'border-[#A1887F]/30',
    heroBadge: 'bg-stone-950/70 text-stone-200 border-stone-500/40',
    heroButton: 'bg-amber-200 hover:bg-amber-100 text-stone-950 shadow-md',
    headerAccent: 'text-[#4E342E]',
    activeTab: 'bg-[#4E342E] text-white shadow-xs',
    cardAccentBorder: 'hover:border-[#8D6E63]',
  },
  'single-white': {
    id: 'single-white',
    name: 'Pure Fluent White & Slate',
    category: 'single',
    description: 'Crisp, minimalist Windows 11 Fluent aesthetic featuring high-contrast clean white and slate accents.',
    swatches: ['#FFFFFF', '#E2E8F0', '#0F172A'],
    primaryColor: '#0F172A',
    accentColor: '#64748B',
    bannerGradient: 'from-slate-900 via-slate-800 to-slate-900',
    bannerBorder: 'border-slate-700',
    heroBadge: 'bg-slate-800 text-slate-200 border-slate-600',
    heroButton: 'bg-white hover:bg-slate-100 text-slate-900 shadow-md',
    headerAccent: 'text-slate-900',
    activeTab: 'bg-slate-900 text-white shadow-xs',
    cardAccentBorder: 'hover:border-slate-400',
  },
};
