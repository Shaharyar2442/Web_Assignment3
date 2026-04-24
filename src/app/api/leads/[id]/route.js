import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";
import { sendLeadAssignmentEmail } from "@/lib/email";

const updateLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().regex(/^[1-9]\d{9,14}$/, "Valid international phone number required").optional(),
  propertyInterest: z.string().optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(["New", "Contacted", "In Progress", "Closed"]).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().nullable().optional(), // Can be reassigned
  followUpDate: z.string().nullable().optional(),
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
    if (validatedData.budget !== undefined && validatedData.budget !== lead.budget) {
      if (validatedData.budget > 20000000) {
        validatedData.score = "High";
      } else if (validatedData.budget >= 10000000) {
        validatedData.score = "Medium";
      } else {
        validatedData.score = "Low";
      }
    }

    validatedData.lastActivityAt = new Date();

    const updatedLead = await Lead.findByIdAndUpdate(
      params.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    // Phase 4: Activity Log for Updates
    const ActivityLog = (await import("@/models/ActivityLog")).default;
    
    let actionDetails = [];
    if (validatedData.status && validatedData.status !== lead.status) {
      actionDetails.push(`Status changed to ${validatedData.status}`);
    }
    if (validatedData.assignedTo !== undefined && String(validatedData.assignedTo) !== String(lead.assignedTo)) {
      actionDetails.push(`Lead reassigned`);
    }
    if (validatedData.followUpDate !== undefined && String(validatedData.followUpDate) !== String(lead.followUpDate)) {
      actionDetails.push(validatedData.followUpDate ? `Follow-up set to ${new Date(validatedData.followUpDate).toLocaleDateString()}` : "Follow-up removed");
    }
    if (actionDetails.length === 0) {
      actionDetails.push("Lead details updated");
    }

    await ActivityLog.create({
      leadId: updatedLead._id,
      action: "Lead Updated",
      performedBy: session.user.id,
      details: actionDetails.join(", "),
    });

    // Phase 5: Send Email Notification for Assignment
    if (validatedData.assignedTo !== undefined && String(validatedData.assignedTo) !== String(lead.assignedTo) && validatedData.assignedTo !== null) {
      try {
        const agent = await User.findById(validatedData.assignedTo);
        if (agent && agent.email) {
          await sendLeadAssignmentEmail(agent.email, agent.name, updatedLead);
        }
      } catch (e) {
        console.error("Failed to send assignment email", e);
      }
    }

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
