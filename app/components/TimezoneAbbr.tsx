import { useState, useEffect } from 'react';

interface TimezoneAbbrProps {
  dateTime: string;
  timezone?: string;
}

export function TimezoneAbbr({ dateTime, timezone }: TimezoneAbbrProps) {
  const [timezoneAbbr, setTimezoneAbbr] = useState('');

  useEffect(() => {
    const getTimezoneAbbreviation = (tz: string): string => {
      const date = new Date(dateTime);
      const options: Intl.DateTimeFormatOptions = { timeZone: tz, timeZoneName: 'short' };
      return new Intl.DateTimeFormat('en-US', options)
        .formatToParts(date)
        .find(part => part.type === 'timeZoneName')?.value || tz;
    };

    if (timezone) {
      setTimezoneAbbr(getTimezoneAbbreviation(timezone));
    } else {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezoneAbbr(getTimezoneAbbreviation(userTimezone));
    }
  }, [dateTime, timezone]);

  return <>{timezoneAbbr}</>;
}