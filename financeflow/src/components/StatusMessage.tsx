'use client';

import { useEffect, useState } from 'react';

interface StatusMessageProps {
  message: string | null;
  type: 'success' | 'error' | null;
}

export default function StatusMessage({ message, type }: StatusMessageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message && type) {
      setVisible(true);
      if (type === 'success') {
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [message, type]);

  if (!visible || !message) return null;

  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm font-medium animate-fade-in ${
        type === 'error'
          ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      }`}
    >
      {message}
    </div>
  );
}
