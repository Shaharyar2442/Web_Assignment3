import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // If Agent, return limited stats or unauthorized. Assignment says "Admin dashboard with analytics". 
    // We can allow agents to see their own stats, or restrict entirely. Let's restrict to Admin for full analytics,
    // and provide basic stats for Agent if needed.
    const isAdmin = session.user.role === "Admin";
    
    let matchStage = {};
    if (!isAdmin) {
      const mongoose = require("mongoose");
      matchStage.assignedTo = new mongoose.Types.ObjectId(session.user.id);
    }

    const totalLeads = await Lead.countDocuments(matchStage);

    const statusDistribution = await Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const priorityDistribution = await Lead.aggregate([
      { $match: matchStage },
      { $group: { _id: "$score", count: { $sum: 1 } } }
    ]);

    let agentPerformance = [];
    if (isAdmin) {
      agentPerformance = await Lead.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        {
          $group: {
            _id: "$assignedTo",
            totalAssigned: { $sum: 1 },
            closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
            contacted: { $sum: { $cond: [{ $eq: ["$status", "Contacted"] }, 1, 0] } },
            new: { $sum: { $cond: [{ $eq: ["$status", "New"] }, 1, 0] } }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "agentInfo"
          }
        },
        { $unwind: "$agentInfo" },
        {
          $project: {
            _id: 1,
            agentName: "$agentInfo.name",
            totalAssigned: 1,
            closed: 1,
            inProgress: 1,
            contacted: 1,
            new: 1
          }
        }
      ]);
    }

    return NextResponse.json({
      totalLeads,
      statusDistribution: statusDistribution.map(item => ({ name: item._id, value: item.count })),
      priorityDistribution: priorityDistribution.map(item => ({ name: item._id, value: item.count })),
      agentPerformance
    }, { status: 200 });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
