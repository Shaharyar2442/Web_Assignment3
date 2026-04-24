import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const agents = await User.find({ role: "Agent" }).select("name email _id");

    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
