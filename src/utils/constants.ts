// Shift Type Constants
export const SHIFT_TYPES = {
  DAY: 'day',
  EVENING: 'evening',
  NIGHT: 'night',
  OFF: 'off',
} as const;

export const SHIFT_LABELS = {
  [SHIFT_TYPES.DAY]: '데이 근무',
  [SHIFT_TYPES.EVENING]: '이브닝 근무',
  [SHIFT_TYPES.NIGHT]: '나이트 근무',
  [SHIFT_TYPES.OFF]: '휴무',
} as const;

export const SHIFT_SHORT_LABELS = {
  [SHIFT_TYPES.DAY]: 'D',
  [SHIFT_TYPES.EVENING]: 'E',
  [SHIFT_TYPES.NIGHT]: 'N',
  [SHIFT_TYPES.OFF]: 'OFF',
} as const;

export const SHIFT_TIMES = {
  [SHIFT_TYPES.DAY]: '07:00',
  [SHIFT_TYPES.EVENING]: '15:00',
  [SHIFT_TYPES.NIGHT]: '23:00',
  [SHIFT_TYPES.OFF]: '',
} as const;

export const SHIFT_COLORS = {
  [SHIFT_TYPES.DAY]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    gradient: 'from-amber-400 to-orange-500',
  },
  [SHIFT_TYPES.EVENING]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    gradient: 'from-orange-400 to-red-500',
  },
  [SHIFT_TYPES.NIGHT]: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    gradient: 'from-indigo-500 to-purple-600',
  },
  [SHIFT_TYPES.OFF]: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    gradient: 'from-slate-400 to-gray-500',
  },
} as const;

// Avatar Colors (Toss-inspired palette)
export const AVATAR_COLORS = [
  '#3182f6', '#2272eb', '#1b64da', // Blues
  '#00c7c7', '#00b8b8', '#00a8a8', // Cyans
  '#6dd49d', '#5ec58d', '#4eb67d', // Greens
  '#f59e0b', '#f59e0b', '#f59e0b', // Ambers
  '#f04452', '#e03444', '#d02436', // Reds
  '#8b5cf6', '#7c3aed', '#6d28d9', // Purples
  '#ec4899', '#db2777', '#be185d', // Pinks
] as const;

// Storage Keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'nurseScheduler_currentUser',
  CURRENT_TEAM: 'nurseScheduler_currentTeam',
  TASKS: 'nurseScheduler_tasks',
  TEAMS: 'nurseScheduler_teams',
  TEAM_VIEW_TITLE: 'nurseScheduler_teamViewTitle',
  BOARD_POSTS: 'nurseScheduler_boardPosts',
} as const;

// Animation Variants
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};
