'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicScheduleTable from './components/PublicScheduleTable';

export default function SchedulePage() {
  const router = useRouter();

  useEffect(() => {
    // اعتراض زر المتصفح عند التواجد في صفحة /schedule
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      e.preventDefault();

      const sessionUser = sessionStorage.getItem('user');
      const localUser = localStorage.getItem('user');
      const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

      if (activeUser && activeUser.username) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return <PublicScheduleTable />;
}