'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Icon from '../ui/Icon';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const RevenueChart = ({ data: ordersData = [] }) => {
  // Process orders data to create monthly revenue
  const processRevenueData = () => {
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    // Initialize last 12 months with 0 revenue
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenue[monthKey] = 0;
    }
    
    // Calculate revenue from orders
    ordersData.forEach(order => {
      if (order.created_at && order.total_amount) {
        const orderDate = new Date(order.created_at);
        const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += order.total_amount || 0;
        }
      }
    });
    
    return Object.values(monthlyRevenue);
  };

  const revenueData = processRevenueData();
  const targetData = revenueData.map(value => value * 1.2); // 20% above actual

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Target',
        data: targetData,
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Target</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export const OrderVolumeChart = ({ data: ordersData = [] }) => {
  // Process orders data to create monthly order counts
  const processOrderVolumeData = () => {
    const monthlyOrders = {};
    const currentDate = new Date();
    
    // Initialize last 12 months with 0 orders
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyOrders[monthKey] = 0;
    }
    
    // Count orders by month
    ordersData.forEach(order => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyOrders.hasOwnProperty(monthKey)) {
          monthlyOrders[monthKey] += 1;
        }
      }
    });
    
    return Object.values(monthlyOrders);
  };

  const orderVolumeData = processOrderVolumeData();

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Orders',
        data: orderVolumeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Volume</h3>
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <Icon name="refresh" className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export const CustomerDistributionChart = ({ data: customersData = [] }) => {
  // Process customer data to calculate new vs returning customers
  const processCustomerData = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    let newCustomers = 0;
    let returningCustomers = 0;
    
    customersData.forEach(customer => {
      if (customer.created_at) {
        const customerDate = new Date(customer.created_at);
        if (customerDate >= thirtyDaysAgo) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      }
    });
    
    const total = newCustomers + returningCustomers;
    if (total === 0) return { newCustomers: 0, returningCustomers: 0, newPercent: 0, returningPercent: 0 };
    
    return {
      newCustomers,
      returningCustomers,
      newPercent: Math.round((newCustomers / total) * 100),
      returningPercent: Math.round((returningCustomers / total) * 100)
    };
  };

  const customerStats = processCustomerData();

  const data = {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [customerStats.newCustomers, customerStats.returningCustomers],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
    },
    cutout: '60%',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{customerStats.newPercent}%</div>
          <div className="text-sm text-gray-600">New Customers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{customerStats.returningPercent}%</div>
          <div className="text-sm text-gray-600">Returning Customers</div>
        </div>
      </div>
    </div>
  );
};
