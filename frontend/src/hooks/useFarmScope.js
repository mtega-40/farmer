import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFarms } from './useFarms';

const LAST_FARM_KEY = 'last_farm_id';

export const useFarmScope = () => {
  const { farmId: routeFarmId } = useParams();
  const navigate = useNavigate();
  const { farms, loading: farmsLoading } = useFarms();
  const [farmId, setFarmId] = useState(routeFarmId ? String(routeFarmId) : '');

  useEffect(() => {
    if (routeFarmId) {
      setFarmId(String(routeFarmId));
    }
  }, [routeFarmId]);

  useEffect(() => {
    if (farmId || farmsLoading || farms.length === 0) return;
    const remembered = localStorage.getItem(LAST_FARM_KEY);
    const initial = farms.some((f) => String(f.id) === remembered) ? remembered : String(farms[0].id);
    setFarmId(initial);
  }, [farms, farmsLoading, farmId]);

  const selectFarm = useCallback((nextId) => {
    setFarmId(nextId);
    if (nextId) localStorage.setItem(LAST_FARM_KEY, nextId);
  }, []);

  const farm = farms.find((f) => String(f.id) === String(farmId)) || null;

  return { farmId, farm, farms, farmsLoading, selectFarm, navigate };
};

export default useFarmScope;
