'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import KPICard from '../../components/dashboard/KPICard';
import { RevenueChart, OrderVolumeChart } from '../../components/charts/Charts';
import ProductAnalytics from '../../components/dashboard/ProductAnalytics';
import CustomerInsights from '../../components/dashboard/CustomerInsights';
import RecentOrders from '../../components/dashboard/RecentOrders';
import InventoryShipping from '../../components/dashboard/InventoryShipping';
import QuickActions from '../../components/dashboard/QuickActions';
import { supabaseHelpers } from '../../lib/supabase';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    products: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await supabaseHelpers.getAnalyticsData();
      
      if (data.errors.ordersError || data.errors.productsError || data.errors.customersError) {
        console.error('Error fetching dashboard data:', data.errors);
        setError('Some data could not be loaded. Using fallback data.');
        // Fallback to mock data
        setDashboardData({
          orders: [
            { total_amount: 89.50, status: 'delivered', created_at: '2024-01-15T00:00:00Z' },
            { total_amount: 124.99, status: 'delivered', created_at: '2024-01-14T00:00:00Z' },
            { total_amount: 67.25, status: 'shipped', created_at: '2024-01-13T00:00:00Z' }
          ],
          products: [
            { id: 1, title: 'Summer Dress', price: 89.50, category: 'clothing', quantity: 45 },
            { id: 2, title: 'Designer Handbag', price: 124.99, category: 'accessories', quantity: 23 }
          ],
          customers: [
            { id: 1, created_at: '2024-01-01T00:00:00Z' },
            { id: 2, created_at: '2024-01-15T00:00:00Z' }
          ]
        });
      } else {
        setDashboardData(data);
      }
      setLastUpdated(new Date());
      
      // Generate notifications based on new data
      const newNotifications = generateNotifications();
      setNotifications(newNotifications);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateNotifications = () => {
    const newNotifications = [];
    
    // Check for low stock products
    const lowStockProducts = dashboardData.products.filter(product => (product.quantity || 0) < 10);
    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'warning',
        message: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} running low on stock`,
        timestamp: new Date()
      });
    }
    
    // Check for recent orders
    const recentOrders = dashboardData.orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return orderDate > oneHourAgo;
    });
    
    if (recentOrders.length > 0) {
      newNotifications.push({
        id: 'new-orders',
        type: 'info',
        message: `${recentOrders.length} new order${recentOrders.length > 1 ? 's' : ''} in the last hour`,
        timestamp: new Date()
      });
    }
    
    return newNotifications;
  };

  const calculateKPIs = () => {
    const totalRevenue = dashboardData.orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = dashboardData.orders.length;
    const totalCustomers = dashboardData.customers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return [
      { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+12.5%", changeType: "up", icon: "revenue", color: "pink" },
      { title: "Total Orders", value: totalOrders.toLocaleString(), change: "+8.2%", changeType: "up", icon: "orders", color: "purple" },
      { title: "Conversion Rate", value: "3.24%", change: "+0.5%", changeType: "up", icon: "conversion", color: "rose" },
      { title: "Avg. Order Value", value: `$${avgOrderValue.toFixed(2)}`, change: "-2.1%", changeType: "down", icon: "revenue", color: "fuchsia" }
    ];
  };

  const kpis = calculateKPIs();

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
      {/* Header */}
      <Header lastUpdated={lastUpdated} onRefresh={() => fetchDashboardData(true)} refreshing={refreshing} />

      {/* Main Content */}
      <main className="p-6">
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="mb-6 space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.type === 'warning' 
                      ? 'bg-orange-50 border-orange-200 text-orange-800' 
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {notification.type === 'warning' ? (
                          <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs opacity-75">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button 
                    onClick={() => setError(null)}
                    className="text-yellow-400 hover:text-yellow-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => (
              <KPICard 
                key={index}
                title={kpi.title} 
                value={kpi.value} 
                change={kpi.change} 
                changeType={kpi.changeType} 
                icon={kpi.icon} 
                color={kpi.color} 
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart data={dashboardData.orders} />
            <OrderVolumeChart data={dashboardData.orders} />
          </div>

          {/* Product Analytics */}
          <div className="mb-8">
            <ProductAnalytics data={dashboardData.products} />
          </div>

          {/* Customer Insights */}
          <div className="mb-8">
            <CustomerInsights data={dashboardData.customers} />
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <RecentOrders data={dashboardData.orders} />
          </div>

          {/* Inventory & Shipping */}
          <div className="mb-8">
            <InventoryShipping />
          </div>


          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>
        </main>
    </div>
  );
}
