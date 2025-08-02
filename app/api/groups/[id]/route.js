import {connectDB} from "@/lib/db";
import Group from "@/models/Group";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const { name, members } = await req.json();

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { name, members },
      { new: true }
    );

    if (!updatedGroup) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGroup);
  } catch (err) {
    return NextResponse.json({ message: "Error updating group", error: err }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Group.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Error deleting group", error: err }, { status: 500 });
  }
}
