import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useResource = (api, { farmId: routeFarmId, defaultMessage = 'Failed to load data' } = {}) => {
  const params = useParams();
  const farmId = routeFarmId ?? params.farmId;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!farmId) {
      setItems([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAll(farmId);
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || defaultMessage;
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [api, farmId, defaultMessage]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id, deleteCall, successMessage = 'Deleted successfully') => {
    if (!window.confirm('Are you sure you want to delete this item?')) return false;
    try {
      await deleteCall(farmId, id);
      toast.success(successMessage);
      await load();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
      return false;
    }
  };

  return { items, setItems, loading, error, reload: load, remove, farmId };
};

export default useResource;
