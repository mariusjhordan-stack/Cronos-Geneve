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
    <div
      className={cn(
        'flex items-center gap-6 sm:gap-8 border-b border-cronos-line overflow-x-auto max-w-full',
        className
      )}
    >
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
        'relative -mb-px pb-3.5 text-xs font-sans uppercase tracking-[0.22em] transition-colors duration-150 border-b-2 rounded-none cursor-pointer shrink-0 whitespace-nowrap',
        isActive
          ? 'text-cronos-text border-cronos-bronze font-medium'
          : 'text-cronos-muted border-transparent hover:text-cronos-text hover:border-cronos-line',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={cn('pt-8', className)}>{children}</div>;
}
