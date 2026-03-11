import dbConnect from '@/lib/dbConnect';
import { CategoryData } from '@/models/CategoryData';

export async function GET(request) {
  try {
    await dbConnect();
    const categories = await CategoryData.find({});
    return Response.json({ success: true, data: categories });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const newDoc = await CategoryData.create(body);
    return Response.json({ success: true, data: newDoc });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
