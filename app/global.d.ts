declare module 'geoip-lite' {
  export function lookup(ip: string): {
    country: string;
    // Add other properties as needed
  } | null;
}

declare module 'moment-timezone' {
  const momentTimezone: {
    tz: {
      zonesForCountry(country: string): string[];
    };
  };
  export default momentTimezone;
}