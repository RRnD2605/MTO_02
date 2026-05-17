import { useState, useCallback } from 'react';

const LS_GAMES = 'meteo_golf_games_v1';

export function cleanOldGames(games) {
  const now = Date.now();
  return games.filter((game) => {
    const gameStart = new Date(
      `${game.date}T${String(game.startHour).padStart(2, '0')}:${String(game.startMinute).padStart(2, '0')}:00`
    ).getTime();
    return now < gameStart + 12 * 60 * 60 * 1000;
  });
}

function loadGames() {
  try {
    const raw = localStorage.getItem(LS_GAMES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cleaned = cleanOldGames(Array.isArray(parsed) ? parsed : []);
    localStorage.setItem(LS_GAMES, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return [];
  }
}

export function useGames() {
  const [games, setGamesState] = useState(loadGames);

  const persist = useCallback((next) => {
    const cleaned = cleanOldGames(next);
    localStorage.setItem(LS_GAMES, JSON.stringify(cleaned));
    setGamesState(cleaned);
  }, []);

  const addGame = useCallback((game) => {
    setGamesState((prev) => {
      const next = [...prev, game];
      const cleaned = cleanOldGames(next);
      localStorage.setItem(LS_GAMES, JSON.stringify(cleaned));
      return cleaned;
    });
  }, []);

  const deleteGame = useCallback((id) => {
    setGamesState((prev) => {
      const next = prev.filter((g) => g.id !== id);
      localStorage.setItem(LS_GAMES, JSON.stringify(next));
      return next;
    });
  }, []);

  return { games, addGame, deleteGame };
}
