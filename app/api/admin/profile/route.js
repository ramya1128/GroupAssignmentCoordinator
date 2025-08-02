import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Admin from "@/models/Admin"; 

export async function GET() {
  await connectDB();
  const admin = await Admin.findOne(); 
  return NextResponse.json({ username: admin.username });
}

export async function PUT(req) {
  await connectDB();
  const { username, password } = await req.json();

  try {
    const updated = await Admin.findOneAndUpdate({}, { username, password }, { new: true });
    return NextResponse.json({ message: "Profile updated", admin: updated });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update", error: err }, { status: 500 });
  }
}
