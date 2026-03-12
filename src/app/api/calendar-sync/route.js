import dbConnect from '@/lib/dbConnect';
import { Slot } from '@/models/Slot';
import { fetchRecentEvents, extractSlotDataFromEvent } from '@/lib/googleCalendar';

/**
 * Endpoint to sync Google Calendar events into the Slot booking system
 * This can be triggered manually or via a CRON job (e.g. GitHub Actions, Vercel cron, etc.)
 */
export async function POST(request) {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
       return Response.json({ success: false, error: "GOOGLE_CALENDAR_ID not found in environment." }, { status: 400 });
    }

    // Determine how far back to look for updates.
    // For a real production app, you would store the `lastSyncTime` in the DB.
    // For this demonstration, we'll just check events updated in the last 24 hours.
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const updatedMin = twentyFourHoursAgo.toISOString();

    const events = await fetchRecentEvents(calendarId, updatedMin);

    await dbConnect();

    const results = { created: 0, updated: 0, canceled: 0, errors: 0 };

    for (const event of events) {
      if (!event.start || !event.start.dateTime) {
          // Skip full day events or events without dateTime for now, as slots need specific times
          continue; 
      }

      const slotData = extractSlotDataFromEvent(event);
      // Construct an ID or find mechanism to link Google Event Id to your Slot ID.
      // Easiest is to just add a `googleEventId` field to your Schema, or map based on time & faculty.
      // Here, let's assume `location` or similar can act as a unique identifier for simplicity, OR
      // we just try to update based on the start time and faculty email.
      
      const startTimeStr = new Date(event.start.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const endTimeStr = new Date(event.end.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateOnly = new Date(event.start.dateTime);
      dateOnly.setUTCHours(0,0,0,0);

      const query = {
         date: dateOnly,
         startTime: startTimeStr,
         facultyEmail: slotData.facultyEmail
      };

      if (event.status === 'cancelled') {
         const existingSlot = await Slot.findOneAndUpdate(query, {
             status: 'CANCELED',
             canceledBy: 'google-calendar-sync'
         });
         if (existingSlot) {
            results.canceled++;
         }
      } else {
         // Create or Update
         // Try to find the slot
         const existingSlot = await Slot.findOne(query);

         if (existingSlot) {
             // Event might have been rescheduled or updated
             existingSlot.status = 'BOOKED';
             existingSlot.category = slotData.category;
             existingSlot.batchName = slotData.batchName;
             existingSlot.endTime = endTimeStr;
             existingSlot.updatedBy = 'google-calendar-sync';
             await existingSlot.save();
             results.updated++;
         } else {
             // Event created in Calendar instead of App
             await Slot.create({
                 location: event.location || 'Unknown Location',
                 category: slotData.category,
                 batchName: slotData.batchName,
                 channelName: 'Unknown',
                 lectureType: 'Synced from Calendar',
                 rec: false,
                 studioCode: 'Unknown',
                 facultyEmail: slotData.facultyEmail,
                 facultyName: event.summary || 'Unknown Faculty',
                 date: dateOnly,
                 day: dateOnly.toLocaleDateString('en-US', { weekday: 'long' }),
                 startTime: startTimeStr,
                 endTime: endTimeStr,
                 bookedBy: 'google-calendar-sync'
             });
             results.created++;
         }
      }
    }

    return Response.json({ success: true, message: "Sync successful", results });

  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
