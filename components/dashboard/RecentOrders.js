const RecentOrders = ({ data: ordersData = [] }) => {
  // Process orders data to show recent orders
  const processOrdersData = () => {
    return ordersData
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(order => ({
        id: `#${order.id}`,
        customer: order.name || 'Unknown Customer',
        amount: `$${order.total_amount?.toFixed(2) || '0.00'}`,
        status: order.status || 'pending',
        date: getTimeAgo(order.created_at),
        avatar: getAvatar(order.name)
      }));
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const getAvatar = (name) => {
    if (!name) return '👤';
    const firstLetter = name.charAt(0).toUpperCase();
    const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧'];
    const index = firstLetter.charCodeAt(0) % avatars.length;
    return avatars[index];
  };

  const orders = processOrdersData();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
      </div>
      <div className="space-y-3">
        {orders.map((order, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                {order.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.customer}</p>
                <p className="text-sm text-gray-600">{order.id} • {order.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{order.amount}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
