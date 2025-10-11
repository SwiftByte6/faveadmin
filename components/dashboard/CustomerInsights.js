import Icon from '../ui/Icon';
import { CustomerDistributionChart } from '../charts/Charts';

const CustomerInsights = ({ data: customersData = [] }) => {
  // Process customer data for insights
  const processCustomerData = () => {
    // Group customers by name/email to calculate their total orders and spending
    const customerMap = {};
    
    customersData.forEach(customer => {
      const key = customer.email || customer.name || 'Unknown';
      if (!customerMap[key]) {
        customerMap[key] = {
          name: customer.name || 'Unknown Customer',
          email: customer.email || 'No email',
          orders: 0,
          total: 0,
          avatar: getAvatar(customer.name)
        };
      }
      customerMap[key].orders += 1;
      customerMap[key].total += customer.total_amount || 0;
    });

    // Convert to array and sort by total spending
    const topBuyers = Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map(customer => ({
        ...customer,
        total: `$${customer.total.toFixed(2)}`
      }));

    return { topBuyers };
  };

  const getAvatar = (name) => {
    if (!name) return '👤';
    const firstLetter = name.charAt(0).toUpperCase();
    const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧'];
    const index = firstLetter.charCodeAt(0) % avatars.length;
    return avatars[index];
  };

  const { topBuyers } = processCustomerData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Distribution Chart */}
      <CustomerDistributionChart data={customersData} />

      {/* Top Buyers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Buyers</h3>
          <Icon name="star" className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="space-y-3">
          {topBuyers.map((customer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                  {customer.avatar}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{customer.total}</p>
                <p className="text-sm text-gray-600">{customer.orders} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
