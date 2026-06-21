import { useState, useEffect } from 'react';
import { getStats, saveStats, Stats } from '../db/stats';

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = async () => {
    const s = await getStats();
    setStats(s);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const updateStats = async (newStats: Partial<Stats>) => {
    if (!stats) return;
    const updated = { ...stats, ...newStats };
    await saveStats(updated);
    setStats(updated);
  };

  return { stats, updateStats, refetch: fetchStats };
}
