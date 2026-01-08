'use client';

import { useEffect, useRef } from 'react';

type SmoobuLanguage = 'fr' | 'en' | 'de' | 'es' | 'it' | 'nl' | 'pt';

interface SmoobuWidgetProps {
  language?: SmoobuLanguage;
  className?: string;
}

const APARTMENT_ID = '2549323';
const VERIFICATION_TOKEN = '36f87e7911bf9b070b95ae8fcf07a51b1418933ad8eeb41ec9aebbb1bc85acd8';

export const SmoobuWidget = ({ language = 'fr', className }: SmoobuWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const widgetId = `smoobuApartment${APARTMENT_ID}${language}`;
  const calendarUrl = `https://login.smoobu.com/${language}/cockpit/widget/single-calendar/${APARTMENT_ID}`;

  useEffect(() => {
    if (scriptLoaded.current || !containerRef.current) return;

    const existingScript = document.querySelector(
      'script[src="https://login.smoobu.com/js/Apartment/CalendarWidget.js"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://login.smoobu.com/js/Apartment/CalendarWidget.js';
      script.async = true;
      document.body.appendChild(script);
    }

    scriptLoaded.current = true;
  }, []);

  return (
    <div className={className}>
      <div id={widgetId} className="calendarWidget">
        <div
          ref={containerRef}
          className="calendarContent"
          data-load-calendar-url={calendarUrl}
          data-verification={VERIFICATION_TOKEN}
          data-baseurl="https://login.smoobu.com"
          data-disable-css="false"
        />
      </div>
    </div>
  );
};
