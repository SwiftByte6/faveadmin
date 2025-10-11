'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../ui/Icon';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  
  const menuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/", active: pathname === "/" },
    { name: "Products", icon: "products", href: "/products", active: pathname === "/products" },
    { name: "Orders", icon: "orders", href: "/orders", active: pathname === "/orders" },
    { name: "Customers", icon: "customers", href: "/customers", active: pathname === "/customers" },
    { name: "Inventory", icon: "inventory", href: "/inventory", active: pathname === "/inventory" },
    { name: "Analytics", icon: "conversion", href: "/analytics", active: pathname === "/analytics" }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            FaveAdmin
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-6">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon name={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;