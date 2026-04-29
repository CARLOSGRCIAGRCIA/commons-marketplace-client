'use client';

import { useEffect, useState } from 'react';

export function ChatWidgetLoader() {
  const [ChatWidget, setChatWidget] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/components/chat').then((mod) => {
      setChatWidget(() => mod.ChatWidget);
    });
  }, []);

  if (!ChatWidget) return null;

  return <ChatWidget />;
}