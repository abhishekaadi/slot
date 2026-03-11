import dbConnect from '@/lib/dbConnect';
import { Slot } from '@/models/Slot';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const existingSlot = await Slot.findById(id);
    if (!existingSlot) {
      return Response.json({ success: false, error: "Slot not found" }, { status: 404 });
    }

    const { action, userEmail, ...updateData } = body;
    let auditField = 'updatedBy';
    
    // Determine the action for auditing
    if (action === 'CANCEL') {
      updateData.status = 'CANCELED';
      auditField = 'canceledBy';
    } else if (action === 'RESCHEDULE') {
      updateData.status = 'RESCHEDULED';
      auditField = 'rescheduledBy';
    } else if (action === 'SHUFFLE') {
      updateData.status = 'SHUFFLED';
      auditField = 'shuffledBy';
    }

    updateData[auditField] = userEmail || 'admin@physicswallah.com';
    
    // Push history
    updateData.$push = {
        history: {
            action: action || 'UPDATE',
            user: userEmail || 'admin@physicswallah.com',
            details: body
        }
    };

    const updatedSlot = await Slot.findByIdAndUpdate(id, updateData, { new: true });
    return Response.json({ success: true, data: updatedSlot });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Instead of true physical delete, we do a soft delete or just remove it
    await Slot.findByIdAndDelete(id);
    return Response.json({ success: true, message: "Slot deleted" });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
