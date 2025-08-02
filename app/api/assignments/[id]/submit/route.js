import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Assignment from "@/models/Assignment";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const { email, submissionText } = await req.json();

    if (!email || !submissionText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const assignmentExists = await Assignment.findById(id);
    if (!assignmentExists) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    const existing = user.submissions.find(s => s.assignmentId.toString() === id);

    if (existing) {
      existing.text = submissionText;
      existing.submittedAt = new Date();
    } else {
      user.submissions.push({
        assignmentId: id,
        text: submissionText,
        submittedAt: new Date()
      });
    }

    await user.save();
    return NextResponse.json({ message: "Submission successful" });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { email, submissionText } = await req.json();

    if (!email || !submissionText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const assignmentExists = await Assignment.findById(id);
    if (!assignmentExists) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    const submission = user.submissions.find(s => s.assignmentId.toString() === id);
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    submission.text = submissionText;
    submission.submittedAt = new Date();

    await user.save();
    return NextResponse.json({ message: "Submission updated" });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const assignmentExists = await Assignment.findById(id);
    if (!assignmentExists) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    const beforeCount = user.submissions.length;
    user.submissions = user.submissions.filter(s => s.assignmentId.toString() !== id);

    if (user.submissions.length === beforeCount) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ message: "Submission deleted" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
