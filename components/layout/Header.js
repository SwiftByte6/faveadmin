import Icon from '../ui/Icon';

const Header = ({ onMenuClick, lastUpdated, onRefresh, refreshing = false }) => {
  const formatLastUpdated = (date) => {
    if (!date) return 'Never updated';
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleString();
  };

  return (
    <header className=" shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&#39;s what&#39;s happening with your store.</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500">Last updated: {formatLastUpdated(lastUpdated)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={refreshing ? "Refreshing..." : "Refresh data"}
          >
            <Icon 
              name="refresh" 
              className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} 
            />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Icon name="clock" className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
