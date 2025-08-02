import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Assignment from '@/models/Assignment';
import Group from '@/models/Group';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).populate('groupId').lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const assignments = await Assignment.find({ groupId: user.groupId?._id }).lean();

    return NextResponse.json({ user, assignments });
  } catch (err) {
    console.error("[GET user assignments]", err);
    return NextResponse.json({ message: "Failed to fetch user data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userEmail, assignmentId, text } = body;

    if (!userEmail || !assignmentId || !text) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.submissions) user.submissions = [];

    const alreadySubmitted = user.submissions.find(
      (s) => s.assignmentId.toString() === assignmentId
    );
    if (alreadySubmitted) {
      return NextResponse.json({ message: "Already submitted" }, { status: 400 });
    }

    user.submissions.push({ assignmentId, text });
    await user.save();

    await Assignment.findByIdAndUpdate(assignmentId, { $inc: { submissions: 1 } });

    return NextResponse.json({ message: "Submission successful" });
  } catch (err) {
    console.error("[POST user submission]", err);
    return NextResponse.json({ message: "Failed to submit assignment" }, { status: 500 });
  }
}
