"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MenuContext from "./MenuContext";

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openMenu = () => setIsSidebarOpen(true);
  const closeMenu = () => setIsSidebarOpen(false);

  return (
    <MenuContext.Provider value={{ openMenu }}>
      <div className="min-h-screen flex bg-linear-to-br from-pink-50 to-purple-50">
        <Sidebar isOpen={isSidebarOpen} onClose={closeMenu} onMenuClick={openMenu} />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </MenuContext.Provider>
  );
}
