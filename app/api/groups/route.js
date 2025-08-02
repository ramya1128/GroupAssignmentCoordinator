import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";

export async function GET() {
  await connectDB();
  const groups = await Group.find();
  return NextResponse.json(groups);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const group = await Group.create(body);
  return NextResponse.json(group);
}
