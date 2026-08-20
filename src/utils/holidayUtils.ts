/**
 * Fetches Philippine public holidays from Google Calendar API for a given year.
 *
 * @param apiKey  Google Calendar API key (must have Calendar API enabled)
 * @param year    Full 4-digit year
 * @returns       Array of YYYY-MM-DD holiday strings, or null on failure
 */
export async function fetchPhHolidays(apiKey: string, year: number): Promise<string[] | null> {
    const calendarId = 'en.philippines%23holiday%40group.v.calendar.google.com';
    const timeMin = encodeURIComponent(`${year}-01-01T00:00:00Z`);
    const timeMax = encodeURIComponent(`${year}-12-31T23:59:59Z`);
    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
        `?key=${encodeURIComponent(apiKey)}` +
        `&timeMin=${timeMin}&timeMax=${timeMax}` +
        `&singleEvents=true&orderBy=startTime&maxResults=50`;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const dates: string[] = [];
        for (const item of data.items ?? []) {
            const d: string | undefined = item.start?.date || item.start?.dateTime?.slice(0, 10);
            if (d) dates.push(d);
        }
        return [...new Set(dates)].sort();
    } catch {
        return null;
    }
}
