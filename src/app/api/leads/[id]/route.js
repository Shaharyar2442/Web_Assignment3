import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

const updateLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().regex(/^[1-9]\d{9,14}$/, "Valid international phone number required").optional(),
  propertyInterest: z.string().optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(["New", "Contacted", "In Progress", "Closed"]).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().nullable().optional(), // Can be reassigned
});

async function getLeadAndCheckAuth(id, session) {
  await connectToDatabase();
  const lead = await Lead.findById(id);
  
  if (!lead) return null;

  // If agent, they can only access their assigned leads
  if (session.user.role === "Agent" && String(lead.assignedTo) !== session.user.id) {
    return false; // Unauthorized for this lead
  }
  
  return lead;
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const lead = await getLeadAndCheckAuth(params.id, session);
    
    if (lead === null) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    if (lead === false) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    return NextResponse.json(lead, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const lead = await getLeadAndCheckAuth(params.id, session);
    
    if (lead === null) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    if (lead === false) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const validationResult = updateLeadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Recalculate score if budget changed
    if (validatedData.budget && validatedData.budget !== lead.budget) {
      if (validatedData.budget > 20000000) {
        validatedData.score = "High";
      } else if (validatedData.budget >= 10000000) {
        validatedData.score = "Medium";
      } else {
        validatedData.score = "Low";
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      params.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedLead, { status: 200 });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const lead = await getLeadAndCheckAuth(params.id, session);
    
    if (lead === null) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    if (lead === false) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await Lead.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
