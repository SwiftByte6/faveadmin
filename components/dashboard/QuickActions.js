import Icon from '../ui/Icon';

const QuickActions = () => {
  const actions = [
    { name: "Add Product", icon: "products", color: "bg-blue-500 hover:bg-blue-600", description: "Add new product to inventory" },
    { name: "Manage Categories", icon: "dashboard", color: "bg-green-500 hover:bg-green-600", description: "Organize product categories" },
    { name: "View Reports", icon: "conversion", color: "bg-purple-500 hover:bg-purple-600", description: "Generate detailed reports" },
    { name: "View Analytics", icon: "conversion", color: "bg-orange-500 hover:bg-orange-600", description: "Detailed performance metrics" }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button 
            key={index}
            className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 hover:shadow-md group`}
          >
            <Icon name={action.icon} className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{action.name}</span>
            <span className="text-xs opacity-90 text-center">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
