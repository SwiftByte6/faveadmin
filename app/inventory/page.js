'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Icon from '../../components/ui/Icon';
import { supabaseHelpers } from '../../lib/supabase';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseHelpers.getInventory();
      
      if (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to load inventory');
        // Fallback to mock data for women's fashion inventory
        setInventory([
          { id: 1, title: "Floral Summer Dress", category: "clothing", quantity: 45, price: 89.99, images: ["👗"] },
          { id: 2, title: "Designer Handbag", category: "accessories", quantity: 23, price: 199.99, images: ["👜"] },
          { id: 3, title: "High Heel Sandals", category: "shoes", quantity: 67, price: 129.99, images: ["👠"] },
          { id: 4, title: "Statement Necklace", category: "jewelry", quantity: 12, price: 49.99, images: ["💎"] },
          { id: 5, title: "Silk Scarf", category: "accessories", quantity: 89, price: 39.99, images: ["🧣"] },
          { id: 6, title: "Designer Sunglasses", category: "accessories", quantity: 3, price: 159.99, images: ["🕶️"] },
          { id: 7, title: "Cashmere Sweater", category: "clothing", quantity: 7, price: 179.99, images: ["🧥"] },
          { id: 8, title: "Pearl Earrings", category: "jewelry", quantity: 0, price: 89.99, images: ["👂"] }
        ]);
      } else {
        setInventory(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };
  const num=1

  const getStatusColor = (quantity) => {
    if (quantity === 0) return 'bg-gray-100 text-gray-800';
    if (quantity <= 5) return 'bg-red-100 text-red-800';
    if (quantity <= 15) return 'bg-orange-100 text-orange-800';
    return 'bg-pink-100 text-pink-800';
  };

  const getStatusText = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 5) return 'critical';
    if (quantity <= 15) return 'low-stock';
    return 'in-stock';
  };

  const calculateInventoryStats = () => {
    const totalProducts = inventory.length;
    const inStock = inventory.filter(item => item.quantity > 15).length;
    const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= 15).length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;

    return [
      { label: "Total Products", value: totalProducts.toLocaleString(), change: "+5%", color: "pink" },
      { label: "In Stock", value: inStock.toString(), change: "+8%", color: "purple" },
      { label: "Low Stock", value: lowStock.toString(), change: "-12%", color: "orange" },
      { label: "Out of Stock", value: outOfStock.toString(), change: "+3%", color: "red" }
    ];
  };

  const inventoryStats = calculateInventoryStats();

  if (loading) {
    return (
      <div>
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />

        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage product inventory and stock levels for your fashion brand</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {inventoryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} vs last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'pink' ? 'bg-pink-50 text-pink-600' :
                    stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    <Icon name="inventory" className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2">
                  <Icon name="inventory" className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Update Stock
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Export Inventory
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>All Status</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Critical</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{item.images?.[0] || "📦"}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} units</div>
                        <div className="text-xs text-gray-500">Low stock: 15</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.quantity)}`}>
                          {getStatusText(item.quantity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-pink-600 hover:text-pink-900">Edit</button>
                          <button className="text-purple-600 hover:text-purple-900">Update Stock</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </div>
  );
};

export default InventoryPage;
