import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Lead from "@/models/Lead"; // To verify auth
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Check auth
    const lead = await Lead.findById(params.id);
    if (!lead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    if (session.user.role === "Agent" && String(lead.assignedTo) !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const activities = await ActivityLog.find({ leadId: params.id })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
