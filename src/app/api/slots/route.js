import dbConnect from '@/lib/dbConnect';
import { Slot } from '@/models/Slot';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const location = searchParams.get('location');

    let query = {};
    if (date) {
      // Query specific date at 00:00:00 to 23:59:59
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);

      query.date = { $gte: startDate, $lt: endDate };
    }
    if (location) {
      query.location = location;
    }

    await dbConnect();
    const slots = await Slot.find(query).sort({ startTime: 1 });
    return Response.json({ success: true, data: slots });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real app, bookedBy comes from NextAuth session
    // For now we'll accept it in the body for testing
    const bookedBy = body.bookedBy || 'admin@physicswallah.com';

    await dbConnect();

    // Check if it's a weekly recurrence
    if (body.recurrenceWeeks && body.recurrenceWeeks > 1) {
       const slotsToInsert = [];
       const startDate = new Date(body.date);
       
       for(let i=0; i<body.recurrenceWeeks; i++) {
           const newDate = new Date(startDate);
           newDate.setDate(startDate.getDate() + (i * 7));
           slotsToInsert.push({
               ...body,
               date: newDate,
               bookedBy
           });
       }
       
       const inserted = await Slot.insertMany(slotsToInsert);
       return Response.json({ success: true, data: inserted });
    } else {
       // Single slot
       const newSlot = await Slot.create({ ...body, bookedBy });
       return Response.json({ success: true, data: newSlot });
    }
    
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
