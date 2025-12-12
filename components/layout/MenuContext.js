"use client";

import { createContext, useContext } from "react";

const MenuContext = createContext();

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    return { openMenu: () => {} }; // Fallback if not in provider
  }
  return context;
}

export default MenuContext;
