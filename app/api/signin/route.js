import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getCollections } from "../../../lib/api/db";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  try {
    const { usersCollection } = await getCollections();
    const user = await usersCollection.findOne({ email: body.email });
    let pwMatch = false;

    if (user) {
      pwMatch = await bcrypt.compare(body.password, user.password);
    }

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    if (pwMatch) {
      const token = jwt.sign({ _id: String(user._id) }, process.env.JWT_PRIVATE_KEY);

      const response = NextResponse.json(
        {
          token,
          _id: String(user._id),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        { status: 200 }
      );
      response.headers.set("Authorization", `Bearer ${token}`);
      return response;
    }

    return NextResponse.json(
      { error: "Invalid username and password combination" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to sign in user" }, { status: 500 });
  }
}
