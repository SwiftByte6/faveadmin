'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Icon from '../../components/ui/Icon';
import { supabaseHelpers } from '../../lib/supabase';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Get customers from orders data since there's no customers table
      const { data, error } = await supabaseHelpers.getOrders();
      
      if (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers');
        // Fallback to mock data for women's fashion customers
        setCustomers([
          { id: '1', first_name: "Sarah", last_name: "Johnson", email: "sarah@email.com", phone: "+1 (555) 123-4567", total_spent: 2450, created_at: "2023-01-15T00:00:00Z", avatar: "👩" },
          { id: '2', first_name: "Emily", last_name: "Davis", email: "emily@email.com", phone: "+1 (555) 234-5678", total_spent: 1890, created_at: "2023-02-20T00:00:00Z", avatar: "👩" },
          { id: '3', first_name: "Lisa", last_name: "Brown", email: "lisa@email.com", phone: "+1 (555) 345-6789", total_spent: 1650, created_at: "2023-03-10T00:00:00Z", avatar: "👩" },
          { id: '4', first_name: "Jessica", last_name: "Wilson", email: "jessica@email.com", phone: "+1 (555) 456-7890", total_spent: 1320, created_at: "2023-04-05T00:00:00Z", avatar: "👩" },
          { id: '5', first_name: "Amanda", last_name: "Smith", email: "amanda@email.com", phone: "+1 (555) 567-8901", total_spent: 890, created_at: "2023-05-12T00:00:00Z", avatar: "👩" },
          { id: '6', first_name: "Rachel", last_name: "Green", email: "rachel@email.com", phone: "+1 (555) 678-9012", total_spent: 450, created_at: "2023-06-18T00:00:00Z", avatar: "👩" }
        ]);
      } else {
        // Transform orders data to customer format
        const customerMap = new Map();
        data?.forEach(order => {
          const email = order.email;
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: order.id,
              first_name: order.name?.split(' ')[0] || 'Customer',
              last_name: order.name?.split(' ')[1] || '',
              email: order.email,
              phone: order.phone || '+1 (555) 000-0000',
              total_spent: parseFloat(order.total_amount) || 0,
              created_at: order.created_at,
              avatar: "👩"
            });
          } else {
            // Add to total spent
            customerMap.get(email).total_spent += parseFloat(order.total_amount) || 0;
          }
        });
        setCustomers(Array.from(customerMap.values()));
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (totalSpent) => {
    if (totalSpent > 1000) return 'bg-pink-100 text-pink-800';
    if (totalSpent > 500) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (totalSpent) => {
    if (totalSpent > 1000) return 'VIP';
    if (totalSpent > 500) return 'Active';
    return 'New';
  };

  const calculateCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.total_spent > 500).length;
    const vipCustomers = customers.filter(c => c.total_spent > 1000).length;
    const avgSpent = customers.length > 0 ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.length : 0;

    return [
      { label: "Total Customers", value: totalCustomers.toLocaleString(), change: "+15%", color: "pink" },
      { label: "Active Customers", value: activeCustomers.toString(), change: "+12%", color: "purple" },
      { label: "VIP Customers", value: vipCustomers.toString(), change: "+8%", color: "rose" },
      { label: "Avg. Spent", value: `$${avgSpent.toFixed(2)}`, change: "+5%", color: "fuchsia" }
    ];
  };

  const customerStats = calculateCustomerStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
            <p className="text-gray-600">Manage customer information and relationships for your fashion brand</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {customerStats.map((stat, index) => (
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
                    stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                    'bg-fuchsia-50 text-fuchsia-600'
                  }`}>
                    <Icon name="customers" className="w-6 h-6" />
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
                  <Icon name="customers" className="w-4 h-4" />
                  <span>Add Customer</span>
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Import Customers
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Export Customers
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>All Customers</option>
                  <option>VIP</option>
                  <option>Active</option>
                  <option>New</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer List</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-lg mr-3">
                            {customer.avatar || "👩"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {/* Orders count would come from a separate query */}
                        {Math.floor((customer.total_spent || 0) / 89.50)} orders
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${customer.total_spent?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.total_spent || 0)}`}>
                          {getStatusText(customer.total_spent || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-pink-600 hover:text-pink-900">View</button>
                          <button className="text-purple-600 hover:text-purple-900">Edit</button>
                          <button className="text-rose-600 hover:text-rose-900">Orders</button>
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

export default CustomersPage;
