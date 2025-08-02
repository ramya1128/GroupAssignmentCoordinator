import {connectDB} from "@/lib/db";
import Assignment from "@/models/Assignment";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(id, body, { new: true });

    if (!updatedAssignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAssignment);
  } catch (err) {
    return NextResponse.json({ message: "Error updating assignment", error: err }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Assignment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Error deleting assignment", error: err }, { status: 500 });
  }
}
