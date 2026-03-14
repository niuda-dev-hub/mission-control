'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function DemoBanner() {
  const t = useTranslations('demo');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch('/api/demo')
      .then(r => r.json())
      .then(data => setIsDemo(data.demo))
      .catch(() => {});
  }, []);

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-center py-2 px-4 text-sm font-medium z-50 relative">
      <span className="mr-2">🎮</span>
      <span>{t('message')}</span>
      <a
        href="https://github.com/crshdn/mission-control"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 underline hover:text-blue-200 transition-colors"
      >
        {t('cta')}
      </a>
    </div>
  );
}
