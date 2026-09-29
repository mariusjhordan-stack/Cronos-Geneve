import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [currentTab, setCurrentTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : currentTab;
  const setActiveTab = onValueChange || setCurrentTab;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div className={cn('flex items-center gap-6 border-b border-cronos-line', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'pb-3 text-xs uppercase tracking-[0.2em] font-sans transition-all relative',
        isActive
          ? 'text-white border-b-2 border-cronos-bronze font-medium'
          : 'text-cronos-muted hover:text-cronos-text'
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={cn('pt-6', className)}>{children}</div>;
}
