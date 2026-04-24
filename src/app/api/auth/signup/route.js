import { NextResponse } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    // Note: In a real app, only admins might be able to create other admins or agents.
    // For this assignment, we will allow setting role during signup for easier testing.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Agent",
    });

    return Response.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
