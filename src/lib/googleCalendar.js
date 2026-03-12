import { google } from 'googleapis';

/**
 * Parses the event description or summary for slot details.
 * Expected format in description (or similar):
 * Category: <Category Name>
 * Batch: <Batch Name>
 * Email: <Faculty Email>
 * 
 * If no specific text format is used, adjust the regex or splitting logic below.
 */
export function extractSlotDataFromEvent(event) {
  const data = {
    category: 'Unknown',
    batchName: 'Unknown',
    facultyEmail: 'unknown@example.com'
  };

  const textToScan = (event.description || '') + ' ' + (event.summary || '');
  
  // Example simplistic extraction using regular expressions
  const categoryMatch = textToScan.match(/Category:\s*(.+)/i);
  const batchMatch = textToScan.match(/Batch:\s*(.+)/i);
  const emailMatch = textToScan.match(/Email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);

  if (categoryMatch && categoryMatch[1]) data.category = categoryMatch[1].trim();
  if (batchMatch && batchMatch[1]) data.batchName = batchMatch[1].trim();
  if (emailMatch && emailMatch[1]) data.facultyEmail = emailMatch[1].trim();

  // If faculty email wasn't in text, fallback to creator or organizer email
  if (data.facultyEmail === 'unknown@example.com') {
    if (event.creator && event.creator.email) {
      data.facultyEmail = event.creator.email;
    } else if (event.organizer && event.organizer.email) {
      data.facultyEmail = event.organizer.email;
    }
  }

  return data;
}

/**
 * Get an authenticated Google Calendar API client
 */
export async function getCalendarClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
     throw new Error("Missing Google Service Account credentials in .env.local");
  }

  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    // Replace \n with actual newlines in case it's escaped in the .env file
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar.readonly']
  );

  await jwtClient.authorize();
  return google.calendar({ version: 'v3', auth: jwtClient });
}

/**
 * Fetch recently updated events since a specific time
 * @param {string} calendarId 
 * @param {string} updatedMin (ISO Date string, e.g. '2023-01-01T00:00:00.000Z')
 */
export async function fetchRecentEvents(calendarId, updatedMin) {
  const calendar = await getCalendarClient();
  
  const response = await calendar.events.list({
    calendarId: calendarId,
    updatedMin: updatedMin, // Only fetch events changed since this time
    showDeleted: true,      // We want to know if events were canceled
    singleEvents: true,     // Expand recurring events
    orderBy: 'updated',
  });

  return response.data.items || [];
}
