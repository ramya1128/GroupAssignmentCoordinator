import { NextResponse } from 'next/server';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import Group from '@/models/Group';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    const assignments = await Assignment.find().lean();
    const users = await User.find().lean();
    const groups = await Group.find().lean(); 

    const enrichedAssignments = assignments.map((assignment) => {
      const group = groups.find(g => g._id.toString() === assignment.groupId.toString());
      const groupMembers = group?.members || [];

      const submittedUsers = users
        .filter(user =>
          user.submissions?.some(
            (s) => s.assignmentId.toString() === assignment._id.toString()
          ) && groupMembers.includes(user.email)
        )
        .map(user => {
          const submission = user.submissions.find(
            (s) => s.assignmentId.toString() === assignment._id.toString()
          );
          return {
            username: user.username,
            email: user.email,
            submissionText: submission?.text || "",
            submittedAt: submission?.submittedAt || null,
          };
        });

      const totalMembers = groupMembers.length;
      const submissionCount = submittedUsers.length;
      const isCompleted = submissionCount >= totalMembers;

      return {
        ...assignment,
        submissionCount,
        totalMembers,
        status: isCompleted ? "completed" : "pending",
        submissions: submittedUsers,
      };
    });

    return NextResponse.json(enrichedAssignments);
  } catch (err) {
    console.error("GET /api/assignments error:", err);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.json();
    const assignment = await Assignment.create(data);

    return NextResponse.json(assignment, { status: 201 });
  } catch (err) {
    console.error("POST /api/assignments error:", err);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
