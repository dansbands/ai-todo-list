import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const guestId = `guest_${crypto.randomUUID()}`;
    const token = jwt.sign(
      { _id: guestId, isGuest: true },
      process.env.JWT_PRIVATE_KEY
    );

    return NextResponse.json(
      {
        token,
        _id: guestId,
        firstName: "Guest",
        lastName: "User",
        email: "guest@local",
        isGuest: true,
        aiRequestLimit: 3,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create guest session" }, { status: 500 });
  }
}
