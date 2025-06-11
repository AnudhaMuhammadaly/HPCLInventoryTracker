import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function calculateCurrentStock(transactions: any[], itemName: string, matSpec: string) {
  return transactions
    .filter(t => t.item === itemName && t.spec === matSpec)
    .reduce((total, t) => total + (t.type === 'IN' ? t.quantity : -t.quantity), 0);
}

export function calculateRunningTotal(transactions: any[], itemName: string, matSpec: string, upToDate: string) {
  return transactions
    .filter(t => t.item === itemName && t.spec === matSpec && t.date <= upToDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((total, t) => total + (t.type === 'IN' ? t.quantity : -t.quantity), 0);
}

export function getUniqueItems(transactions: any[]) {
  const itemMap = new Map();
  
  transactions.forEach(transaction => {
    const key = `${transaction.item}|${transaction.spec}`;
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        item: transaction.item,
        spec: transaction.spec,
        currentStock: 0,
        reorderLevel: transaction.reorderLevel
      });
    }
    
    const summary = itemMap.get(key);
    summary.currentStock += transaction.type === 'IN' ? transaction.quantity : -transaction.quantity;
    summary.reorderLevel = Math.max(summary.reorderLevel, transaction.reorderLevel);
  });

  return Array.from(itemMap.values());
}
