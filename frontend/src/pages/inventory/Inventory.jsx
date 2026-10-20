import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge, StatCard } from '../../components/ui';
import toast from 'react-hot-toast';

const Inventory = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowOnly, setLowOnly] = useState(false);

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await inventoryAPI.getAll(farmId);
      setItems(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await inventoryAPI.delete(farmId, id);
      toast.success('Item deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete item');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  const lowStock = items.filter((i) => Number(i.quantity) <= Number(i.min_quantity));
  const totalValue = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unit_price || 0),
    0
  );
  const filtered = lowOnly ? lowStock : items;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={farm ? `Supplies and stock at ${farm.name}` : 'Select a farm to view its inventory'}
        actions={
          can('inventory', 'create') && farmId ? (
            <Link to={`/farms/${farmId}/inventory/new`} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Link>
          ) : null
        }
      />

      <div className="mb-6">
        <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
      </div>

      {!farmId ? (
        <EmptyState icon={Package} message="Select a farm to view its inventory" />
      ) : loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          message="No inventory yet"
          action={
            can('inventory', 'create') ? (
              <Link to={`/farms/${farmId}/inventory/new`} className="btn-primary">
                Add first item
              </Link>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <StatCard label="Total Items" value={items.length} icon={Package} color="bg-green-500" />
            <StatCard
              label="Low Stock"
              value={lowStock.length}
              icon={AlertTriangle}
              color={lowStock.length ? 'bg-orange-500' : 'bg-gray-400'}
            />
            <StatCard label="Stock Value" value={`$${totalValue.toFixed(2)}`} color="bg-emerald-500" />
          </div>

          <div className="flex items-center mb-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={lowOnly}
                onChange={(e) => setLowOnly(e.target.checked)}
                className="mr-2"
              />
              Show low stock only
            </label>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Package} message="No items match this filter" />
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Item', 'Category', 'Quantity', 'Unit Price', 'Value', 'Supplier', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((item) => {
                    const isLow = Number(item.quantity) <= Number(item.min_quantity);
                    return (
                      <tr key={item.id} className={isLow ? 'bg-orange-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.name}
                          {isLow && <Badge tone="orange">Low stock</Badge>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.category || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">${Number(item.unit_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${(Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.supplier || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            {can('inventory', 'update') && (
                              <Link
                                to={`/farms/${farmId}/inventory/${item.id}/edit`}
                                className="btn-secondary px-2 py-1 flex items-center"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {can('inventory', 'delete') && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inventory;
