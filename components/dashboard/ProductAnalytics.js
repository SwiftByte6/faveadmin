import Icon from '../ui/Icon';

const ProductAnalytics = ({ data: productsData = [] }) => {
  // Process products data for analytics
  const processProductsData = () => {
    // For top products, we'll use the products with highest prices as a proxy for popularity
    const topProducts = productsData
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5)
      .map(product => ({
        name: product.title || 'Unknown Product',
        sales: Math.floor(Math.random() * 1000) + 100, // Mock sales data since we don't have actual sales
        revenue: `$${((product.price || 0) * (Math.floor(Math.random() * 1000) + 100)).toLocaleString()}`,
        growth: `+${Math.floor(Math.random() * 20) + 1}%`,
        image: getProductEmoji(product.title)
      }));

    // For low stock, use products with low quantity
    const lowStockProducts = productsData
      .filter(product => (product.quantity || 0) < 20)
      .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
      .slice(0, 4)
      .map(product => ({
        name: product.title || 'Unknown Product',
        stock: product.quantity || 0,
        status: (product.quantity || 0) < 10 ? 'critical' : 'low',
        image: getProductEmoji(product.title)
      }));

    return { topProducts, lowStockProducts };
  };

  const getProductEmoji = (title) => {
    if (!title) return '📦';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('phone') || titleLower.includes('mobile')) return '📱';
    if (titleLower.includes('laptop') || titleLower.includes('computer')) return '💻';
    if (titleLower.includes('watch') || titleLower.includes('clock')) return '⌚';
    if (titleLower.includes('headphone') || titleLower.includes('audio')) return '🎧';
    if (titleLower.includes('mouse')) return '🖱️';
    if (titleLower.includes('keyboard')) return '⌨️';
    if (titleLower.includes('monitor') || titleLower.includes('screen')) return '🖥️';
    if (titleLower.includes('camera') || titleLower.includes('webcam')) return '📹';
    if (titleLower.includes('cable') || titleLower.includes('wire')) return '🔌';
    if (titleLower.includes('dress') || titleLower.includes('clothing')) return '👗';
    if (titleLower.includes('bag') || titleLower.includes('handbag')) return '👜';
    return '📦';
  };

  const { topProducts, lowStockProducts } = processProductsData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Selling Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          <Icon name="products" className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{product.image}</div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales.toLocaleString()} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{product.revenue}</p>
                <p className="text-sm text-green-600">{product.growth}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          <Icon name="warning" className="w-5 h-5 text-orange-500" />
        </div>
        <div className="space-y-3">
          {lowStockProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{product.image}</div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Only {product.stock} left</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'critical' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {product.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;
