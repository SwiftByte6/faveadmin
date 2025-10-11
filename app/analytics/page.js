'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Icon from '../../components/ui/Icon';
import { RevenueChart, OrderVolumeChart, CustomerDistributionChart } from '../../components/charts/Charts';
import { supabaseHelpers } from '../../lib/supabase';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
    orders: [],
    products: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await supabaseHelpers.getAnalyticsData();
      
      if (data.errors.ordersError || data.errors.productsError || data.errors.customersError) {
        console.error('Error fetching analytics:', data.errors);
        setError('Failed to load analytics data');
        // Fallback to mock data
        setAnalyticsData({
          orders: [
            { total_amount: 89.50, status: 'delivered' },
            { total_amount: 124.99, status: 'delivered' },
            { total_amount: 67.25, status: 'delivered' }
          ],
          products: [
            { id: 1, title: 'Summer Dress', price: 89.50, category: 'clothing' },
            { id: 2, title: 'Designer Handbag', price: 124.99, category: 'accessories' }
          ],
          customers: [
            { id: 1, created_at: '2024-01-01T00:00:00Z' },
            { id: 2, created_at: '2024-01-15T00:00:00Z' }
          ]
        });
      } else {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsStats = () => {
    const totalRevenue = analyticsData.orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = analyticsData.orders.length;
    const totalCustomers = analyticsData.customers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    return [
      { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+12.5%", color: "pink" },
      { label: "Total Orders", value: totalOrders.toLocaleString(), change: "+8.2%", color: "purple" },
      { label: "Conversion Rate", value: `${conversionRate.toFixed(2)}%`, change: "+0.5%", color: "rose" },
      { label: "Avg. Order Value", value: `$${avgOrderValue.toFixed(2)}`, change: "-2.1%", color: "fuchsia" }
    ];
  };

  const analyticsStats = calculateAnalyticsStats();

  const topPages = [
    { page: "/products", views: 12450, unique: 8920, bounce: "45%" },
    { page: "/home", views: 9670, unique: 7230, bounce: "38%" },
    { page: "/cart", views: 5890, unique: 4560, bounce: "52%" },
    { page: "/checkout", views: 3240, unique: 2890, bounce: "28%" },
    { page: "/about", views: 2180, unique: 1950, bounce: "41%" }
  ];

  const deviceStats = [
    { device: "Desktop", percentage: 65, users: 1850 },
    { device: "Mobile", percentage: 30, users: 854 },
    { device: "Tablet", percentage: 5, users: 143 }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive analytics and performance insights for your fashion brand</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Analytics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticsStats.map((stat, index) => (
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
                    <Icon name="conversion" className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart />
            <OrderVolumeChart />
          </div>

          {/* Customer Distribution */}
          <div className="mb-8">
            <CustomerDistributionChart />
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Pages */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{page.page}</p>
                      <p className="text-sm text-gray-600">{page.unique.toLocaleString()} unique views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Bounce: {page.bounce}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Statistics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
              <div className="space-y-4">
                {deviceStats.map((device, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{device.device}</span>
                      <span className="font-semibold text-gray-900">{device.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          device.device === 'Desktop' ? 'bg-blue-500' :
                          device.device === 'Mobile' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{device.users.toLocaleString()} users</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2">
                  <Icon name="conversion" className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Schedule Report
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Custom Dashboard
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
                <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
};

export default AnalyticsPage;
