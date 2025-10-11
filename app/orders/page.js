'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Icon from '../../components/ui/Icon';
import { supabaseHelpers, supabase } from '../../lib/supabase';

const OrdersPage = () => {
  // Define valid order statuses that the database accepts
  const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
    
    return () => {
      // Cleanup subscription on unmount
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Real-time subscription for order updates
  const setupRealtimeSubscription = () => {
    const newSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('Order change received:', payload);
          console.log('Event type:', payload.eventType);
          console.log('New data:', payload.new);
          console.log('Old data:', payload.old);
          
          // Handle different types of changes
          if (payload.eventType === 'UPDATE') {
            console.log('Updating order in local state');
            // Update specific order in local state
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === payload.new.id 
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'INSERT') {
            console.log('Adding new order to local state');
            // Add new order to local state
            setOrders(prevOrders => [payload.new, ...prevOrders]);
          } else if (payload.eventType === 'DELETE') {
            console.log('Removing order from local state');
            // Remove order from local state
            setOrders(prevOrders => 
              prevOrders.filter(order => order.id !== payload.old.id)
            );
          } else {
            console.log('Refreshing entire list due to unknown event type');
            // For other events, refresh the entire list
            fetchOrders();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    setSubscription(newSubscription);
    return newSubscription;
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Always exclude cancelled orders from the main view
    filtered = filtered.filter(order => order.status !== 'cancelled');

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (excluding cancelled since they're already filtered out)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseHelpers.getOrders();
      
      console.log('Fetched orders data:', data); // Debug log
      console.log('Order IDs in data:', data?.map(order => ({ id: order.id, status: order.status }))); // Debug order IDs
      
      if (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
        // Fallback to mock data for women's fashion orders with items
        setOrders([
          { 
            id: "ORD-001", 
            name: "Sarah Johnson", 
            email: "sarah@email.com", 
            total_amount: 89.99, 
            status: "delivered", 
            created_at: "2024-01-15T00:00:00Z", 
            items: [
              {
                "id": "13",
                "price": 2150,
                "title": "Kurtis",
                "images": [
                  "https://rtuhyoiiezensxfdswhx.supabase.co/storage/v1/object/public/product-images/1748634821016-WhatsApp%20Image%202025-05-31%20at%2000.55.52_2c205f1f.jpg"
                ],
                "quantity": 1
              }
            ]
          },
          { 
            id: "ORD-002", 
            name: "Emily Davis", 
            email: "emily@email.com", 
            total_amount: 156.50, 
            status: "processing", 
            created_at: "2024-01-15T00:00:00Z", 
            items: [
              {
                "id": "14",
                "price": 1200,
                "title": "Dress",
                "images": [
                  "https://rtuhyoiiezensxfdswhx.supabase.co/storage/v1/object/public/product-images/dress.jpg"
                ],
                "quantity": 2
              }
            ]
          }
        ]);
      } else {
        // Handle the data structure from getOrders()
        const ordersWithParsedItems = (data || []).map(order => {
          let parsedItems = [];
          
          try {
            if (order.order_items && Array.isArray(order.order_items)) {
              // If we have order_items from JOIN query
              parsedItems = order.order_items;
            } else if (order.items) {
              // If we have items field directly
              if (typeof order.items === 'string') {
                // If items is stored as JSON string, parse it
                parsedItems = JSON.parse(order.items);
              } else if (Array.isArray(order.items)) {
                // If items is already an array
                parsedItems = order.items;
              } else {
                // If items is an object, wrap it in array
                parsedItems = [order.items];
              }
            }
          } catch (e) {
            console.error('Error parsing items for order', order.id, e);
            parsedItems = [];
          }
          
          return {
            ...order,
            items: parsedItems
          };
        });
        
        console.log('Processed orders with items:', ordersWithParsedItems);
        setOrders(ordersWithParsedItems);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-pink-100 text-pink-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-rose-100 text-rose-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Order management functions
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      // Basic validation
      if (!newStatus || newStatus.trim() === '') {
        setNotification({ 
          type: 'error', 
          message: 'Status cannot be empty' 
        });
        return;
      }
      
      if (!orderId) {
        setNotification({ 
          type: 'error', 
          message: 'Order ID cannot be empty' 
        });
        return;
      }
      
      setIsUpdating(true);
      
      // Optimistically update local state first
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      const { data, error } = await supabaseHelpers.updateOrderStatus(orderId, newStatus);
      
      if (error) {
        console.error('Error updating order status:', error);
        setError(`Failed to update order status: ${error.message || 'Unknown error'}`);
        setNotification({ 
          type: 'error', 
          message: `Failed to update order status: ${error.message || 'Unknown error'}` 
        });
        
        // Revert the optimistic update on error
        fetchOrders();
      } else {
        console.log('Status updated successfully');
        setError(null);
        setNotification({ 
          type: 'success', 
          message: `Order status updated to "${newStatus}" successfully` 
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Exception during update:', err);
      setError(`Exception during update: ${err.message}`);
      setNotification({ 
        type: 'error', 
        message: `Exception during update: ${err.message}` 
      });
      
      // Revert the optimistic update on error
      fetchOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    await handleUpdateStatus(orderId, 'processing');
    setUpdatingOrderId(null);
  };

  const handleRejectOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    await handleUpdateStatus(orderId, 'cancelled');
    setUpdatingOrderId(null);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      // Basic validation - only check for empty/null values
      if (!newStatus || newStatus.trim() === '') {
        console.error('Empty status value:', newStatus);
        setNotification({ 
          type: 'error', 
          message: 'Status cannot be empty' 
        });
        return;
      }
      
      setIsUpdating(true);
      
      // Optimistically update local state first
      setOrders(prevOrders => 
        prevOrders.map(order => 
          selectedOrders.includes(order.id) 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      const promises = selectedOrders.map(orderId => 
        supabaseHelpers.updateOrderStatus(orderId, newStatus)
      );
      
      await Promise.all(promises);
      
      setSelectedOrders([]);
      setError(null);
      setNotification({ 
        type: 'success', 
        message: `${selectedOrders.length} orders updated to ${newStatus} successfully` 
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update order statuses');
      setNotification({ type: 'error', message: 'Failed to update order statuses' });
      
      // Revert the optimistic update on error
      fetchOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportOrders = () => {
    const dataStr = JSON.stringify(filteredOrders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'orders.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const calculateOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    return [
      { label: "Total Orders", value: totalOrders.toLocaleString(), change: "+12%", color: "pink" },
      { label: "Pending Orders", value: pendingOrders.toString(), change: "-5%", color: "orange" },
      { label: "Completed Orders", value: completedOrders.toString(), change: "+8%", color: "purple" },
      { label: "Cancelled Orders", value: cancelledOrders.toString(), change: "+2%", color: "red" }
    ];
  };

  const orderStats = calculateOrderStats();

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
                <p className="text-gray-600">Manage and track customer orders for your fashion brand</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Real-time connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {notification && (
            <div className={`mb-6 px-4 py-3 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button 
                  onClick={() => setNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Order Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {orderStats.map((stat, index) => (
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
                    <Icon name="orders" className="w-6 h-6" />
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
                  <Icon name="orders" className="w-4 h-4" />
                  <span>Create Order</span>
                </button>
                <button 
                  onClick={handleExportOrders}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Export Orders
                </button>
                <button 
                  onClick={fetchOrders}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Refresh Orders
                </button>
                {selectedOrders.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedOrders.length} selected</span>
                    <select 
                      onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      disabled={isUpdating}
                    >
                      <option value="">Bulk Actions</option>
                      {VALID_ORDER_STATUSES.filter(status => status !== 'pending').map(status => (
                        <option key={status} value={status}>
                          Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {VALID_ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Orders ({filteredOrders.length})
              </h2>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="w-4 h-4" disabled />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-xs text-gray-500">Order #{order.id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm mr-3">
                            👩
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.name}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col space-y-2">
                          <span className="font-medium text-gray-900">
                            {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} items
                          </span>
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                  {item.images && item.images.length > 0 && (
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.title || 'Product'}
                                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-gray-700 font-medium truncate">
                                      {item.title || 'Unknown Product'}
                                    </div>
                                    <div className="text-gray-500">
                                      ₹{item.price || 0} × {item.quantity || 1} = ₹{(item.price || 0) * (item.quantity || 1)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-xs text-gray-400 pl-8">
                                  +{order.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          )}
                          {(!order.items || order.items.length === 0) && (
                            <span className="text-xs text-gray-400">No items</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                          disabled={isUpdating}
                        >
                          {VALID_ORDER_STATUSES.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            View
                          </button>
                          {order.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleAcceptOrder(order.id)}
                                disabled={updatingOrderId === order.id}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                              >
                                {updatingOrderId === order.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <span>Accept</span>
                                )}
                              </button>
                              <button 
                                onClick={() => handleRejectOrder(order.id)}
                                disabled={updatingOrderId === order.id}
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                              >
                                {updatingOrderId === order.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <span>Reject</span>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Order Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">₹{selectedOrder.total_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Customer Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedOrder.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedOrder.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{selectedOrder.address}</span>
                      </div>
                      {selectedOrder.city && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium">{selectedOrder.city}</span>
                        </div>
                      )}
                      {selectedOrder.pincode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pincode:</span>
                          <span className="font-medium">{selectedOrder.pincode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({selectedOrder.items.length})</h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {item.images && item.images.length > 0 ? (
                                  <div className="relative">
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.title || 'Product'}
                                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                      onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjkgMjUuMzEzNyAxMy45IDIyVjE4QzEzLjkgMTQuNjg2MyAxNi41ODYzIDEyIDIwIDEyQzIzLjMxMzcgMTIgMjYuMSAxNC42ODYzIDI2LjEgMThWMjJDMjYuMSAyNS4zMTM3IDIzLjQxMzcgMjggMjAgMjhaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNiAxNi41SDI4VjMxLjVIMTJWMTYuNUgxNFYxNUMxNCA5LjIgMTguMjA1IDYgMjQgNkMyOS43OTUgNiAzNCAxMC43OTUgMzQgMTZWMTguNUgzMlYxNkMzMiAxMi42ODYzIDI5LjMxMzcgMTAgMjYgMTBDMjIuNjg2MyAxMCAyMCAxMi42ODYzIDIwIDE2VjE2LjVIMjJWMTZIMjZWMTZDMjYgMTIuNjg2MyAyOC42ODYzIDEwIDMyIDEwQzM1LjMxMzcgMTAgMzggMTIuNjg2MyAzOCAxNlYzMS41SDJWMTZDMiAxMi42ODYzIDQuNjg2MyAxMCA4IDEwQzExLjMxMzcgMTAgMTQgMTIuNjg2MyAxNCAxNlYxNi41SDE2VjE2WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4K';
                                      }}
                                    />
                                    {item.images.length > 1 && (
                                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        +{item.images.length - 1}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No Image</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.title || 'Unknown Product'}
                                  </div>
                                  {item.id && (
                                    <div className="text-xs text-gray-500">ID: {item.id}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₹{(item.price || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {item.quantity || 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                          <tr>
                            <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              Total Amount:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">
                              ₹{selectedOrder.total_amount?.toLocaleString() || 0}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* No Items Message */}
                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="text-gray-400 text-sm">No items found for this order</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
                <button 
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    // Handle order status update
                    const newStatus = selectedOrder.status === 'pending' ? 'processing' : 
                                    selectedOrder.status === 'processing' ? 'shipped' : 
                                    selectedOrder.status === 'shipped' ? 'delivered' : 'pending';
                    handleUpdateStatus(selectedOrder.id, newStatus);
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default OrdersPage;
