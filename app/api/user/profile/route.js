import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Assignment from "@/models/Assignment";
import Group from "@/models/Group";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = await Group.find({ members: email }).lean();

    const groupData = await Promise.all(
      groups.map(async (group) => {
        const members = await User.find({ email: { $in: group.members } }).select("username email -_id");

        const groupAssignments = await Assignment.find({ groupId: group._id });

        const processedAssignments = groupAssignments.map((assignment) => {
          const submission = (user.submissions || []).find(
            (s) => s.assignmentId.toString() === assignment._id.toString()
          );

          return {
            _id: assignment._id,
            groupId: group._id,
            title: assignment.title,
            description: assignment.description,
            deadline: assignment.deadline,
            status: submission ? "submitted" : "pending",
            submissionText: submission?.text || "",
            submittedAt: submission?.submittedAt || null,
            grade: submission?.grade || "",
            feedback: submission?.feedback || "",
            groupName: group.name
          };
        });

        return {
          _id: group._id,
          name: group.name,
          members,
          assignments: processedAssignments
        };
      })
    );

    const allAssignments = groupData.flatMap(g => g.assignments);

    return NextResponse.json({
      user,
      groups: groupData,
      assignments: allAssignments
    });

  } catch (err) {
    console.error("API /profile error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
