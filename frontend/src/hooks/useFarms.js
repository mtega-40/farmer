import { useState, useEffect, useCallback } from 'react';
import { farmAPI } from '../api/index';

const FARM_CACHE_KEY = 'farms_cache';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(FARM_CACHE_KEY)) || [];
  } catch (error) {
    return [];
  }
};

export const useFarms = () => {
  const [farms, setFarms] = useState(() => readCache());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await farmAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setFarms(data);
      localStorage.setItem(FARM_CACHE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load farms');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { farms, loading, error, reload, setFarms };
};

export default useFarms;
