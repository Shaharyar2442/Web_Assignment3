import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the lead's name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number for WhatsApp integration"],
      match: [/^[1-9]\d{9,14}$/, "Please provide a valid phone number in international format without the + sign"],
    },
    propertyInterest: {
      type: String,
      required: [true, "Please specify the property interest"],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, "Please provide a budget"],
      min: [0, "Budget cannot be negative"],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Closed"],
      default: "New",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    score: {
      type: String,
      enum: ["High", "Medium", "Low", "Unassigned"],
      default: "Unassigned",
    },
  },
  {
    timestamps: true,
  }
);

// Lead Scoring Middleware logic will be implemented here or in the API route.
// We'll implement it in the API route upon creation as per Phase 3, but the field exists here.

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
