import { NextResponse } from "next/server";
import { getAuthUser } from "../../../lib/api/auth";
import { getCollections, ObjectId } from "../../../lib/api/db";

export const runtime = "nodejs";

export async function GET(request) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const user = authResult.user;

  if (user.isGuest) {
    return NextResponse.json(
      {
        _id: user._id,
        firstName: "Guest",
        lastName: "User",
        email: "guest@local",
        isGuest: true,
        aiRequestLimit: 3,
      },
      { status: 200 }
    );
  }

  if (!ObjectId.isValid(user._id)) {
    return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
  }

  try {
    const { usersCollection } = await getCollections();
    const foundUser = await usersCollection.findOne({
      _id: new ObjectId(user._id),
    });

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        _id: foundUser._id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("User Error", error);
    return NextResponse.json({ error: "Unable to fetch user" }, { status: 500 });
  }
}
