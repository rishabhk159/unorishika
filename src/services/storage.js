// Local storage helper for player profile and stats

const USER_KEY = 'uno_rishika_player';
const STATS_KEY = 'uno_rishika_stats';

export const AVATARS = [
  { id: 'fire', emoji: '🔥', label: 'Blaze', color: 'from-red-500 to-amber-500' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard', color: 'from-purple-500 to-indigo-600' },
  { id: 'fox', emoji: '🦊', label: 'Clever Fox', color: 'from-orange-500 to-amber-400' },
  { id: 'lion', emoji: '🦁', label: 'King Lion', color: 'from-yellow-500 to-amber-600' },
  { id: 'ninja', emoji: '🥷', label: 'Shadow', color: 'from-slate-700 to-slate-900' },
  { id: 'alien', emoji: '👾', label: 'Cyber', color: 'from-cyan-400 to-blue-600' },
  { id: 'crown', emoji: '👑', label: 'Champion', color: 'from-amber-400 to-yellow-600' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger', color: 'from-emerald-500 to-teal-700' },
];

export const getPlayerProfile = () => {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  // Default profile
  const defaultProfile = {
    username: 'Player_' + Math.floor(1000 + Math.random() * 9000),
    avatar: AVATARS[0].emoji,
    avatarId: AVATARS[0].id,
    level: 1,
    title: 'UNO Novice'
  };
  savePlayerProfile(defaultProfile);
  return defaultProfile;
};

export const savePlayerProfile = (profile) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
};

export const getPlayerStats = () => {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return {
    gamesPlayed: 12,
    wins: 7,
    losses: 5,
    unoCalls: 18,
    cardsDrawn: 64,
    wildPlayed: 24,
  };
};

export const updatePlayerStats = (result) => {
  const current = getPlayerStats();
  const updated = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    wins: result.won ? current.wins + 1 : current.wins,
    losses: result.won ? current.losses : current.losses + 1,
    unoCalls: current.unoCalls + (result.unoCalls || 0),
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
};
