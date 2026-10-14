"use client";

import { createContext, useContext, useEffect, useState } from "react";

const KEY = "dawn-patrol-pro";

type ProContextValue = {
  pro: boolean;
  ready: boolean;
  setPro: (next: boolean) => void;
};

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [pro, setProState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProState(window.localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  function setPro(next: boolean) {
    setProState(next);
    window.localStorage.setItem(KEY, next ? "1" : "0");
  }

  return <ProContext.Provider value={{ pro, ready, setPro }}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  const value = useContext(ProContext);
  if (!value) throw new Error("usePro must be used inside ProProvider");
  return value;
}
