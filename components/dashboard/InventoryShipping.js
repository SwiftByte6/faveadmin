import Icon from '../ui/Icon';

const InventoryShipping = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
          <Icon name="inventory" className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Products</span>
            <span className="font-semibold text-gray-900">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">In Stock</span>
            <span className="font-semibold text-green-600">1,156</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Low Stock</span>
            <span className="font-semibold text-orange-600">67</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Out of Stock</span>
            <span className="font-semibold text-red-600">24</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Stock Health</span>
            <span className="font-semibold text-green-600">92.7%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92.7%' }}></div>
          </div>
        </div>
      </div>

      {/* Shipping Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Shipping Overview</h3>
          <Icon name="truck" className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Pending Shipment</span>
            <span className="font-semibold text-orange-600">23</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">In Transit</span>
            <span className="font-semibold text-blue-600">156</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Delivered Today</span>
            <span className="font-semibold text-green-600">89</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Avg. Delivery Time</span>
            <span className="font-semibold text-gray-900">2.3 days</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">On-Time Delivery</span>
            <span className="font-semibold text-green-600">96.2%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.2%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryShipping;
