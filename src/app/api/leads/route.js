import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

// Validation Schema
const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[1-9]\d{9,14}$/, "Valid international phone number required (no + sign)"),
  propertyInterest: z.string().min(1, "Property interest is required"),
  budget: z.number().min(0, "Budget cannot be negative"),
  status: z.enum(["New", "Contacted", "In Progress", "Closed"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query = {};
    // If agent, only return assigned leads
    if (session.user.role === "Agent") {
      query.assignedTo = session.user.id;
    }

    // Populate assignedTo to get agent name if needed
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validation Middleware Logic
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    await connectToDatabase();

    // Phase 3: Lead Scoring System (Auto assign score on creation)
    // Budget > 20M → High Priority
    // Budget 10M–20M → Medium Priority
    // Budget < 10M → Low Priority
    let score = "Low";
    if (validatedData.budget > 20000000) {
      score = "High";
    } else if (validatedData.budget >= 10000000) {
      score = "Medium";
    }

    const newLead = await Lead.create({
      ...validatedData,
      score,
      // For now, new leads are unassigned unless admin assigns them later
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
