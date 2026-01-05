'use client';

import { useEffect, useRef } from 'react';

interface SmoobuCalendarProps {
  accountId: string;
  apartmentId: string;
  language?: 'fr' | 'en' | 'de' | 'es' | 'it';
  className?: string;
}

export const SmoobuCalendar = ({
  accountId,
  apartmentId,
  language = 'fr',
  className,
}: SmoobuCalendarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetId = `apartmentIframe${apartmentId}`;

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if script already loaded
    const existingScript = document.querySelector(
      'script[src="https://login.smoobu.com/js/Settings/BookingToolIframe.js"]'
    );

    const initializeWidget = () => {
      if (typeof window !== 'undefined' && (window as any).BookingToolIframe) {
        (window as any).BookingToolIframe.initialize({
          url: `https://login.smoobu.com/${language}/booking-tool/iframe/${accountId}/${apartmentId}`,
          baseUrl: 'https://login.smoobu.com',
          target: `#${targetId}`,
        });
      }
    };

    if (existingScript) {
      initializeWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://login.smoobu.com/js/Settings/BookingToolIframe.js';
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, [accountId, apartmentId, language, targetId]);

  return (
    <div
      ref={containerRef}
      id={targetId}
      className={className}
      style={{ minHeight: '500px' }}
    />
  );
};
