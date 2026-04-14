import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getCollections } from "../../../lib/api/db";
import { getAuthUser } from "../../../lib/api/auth";

export const runtime = "nodejs";

const createRegisteredUser = async ({ usersCollection, userPayload }) => {
  let user = await usersCollection.findOne({ email: userPayload.email });

  if (user) {
    return { error: "User already registered" };
  }

  user = {
    ...userPayload,
    password: await bcrypt.hash(userPayload.password, 10),
  };

  const result = await usersCollection.insertOne(user);
  const userId = String(result.insertedId);
  const token = jwt.sign({ _id: userId }, process.env.JWT_PRIVATE_KEY);

  return {
    user,
    userId,
    token,
  };
};

const migrateGuestTodosToUser = async ({ todoCollection, guestUserId, userId }) => {
  await todoCollection.updateMany(
    { userId: guestUserId },
    {
      $set: {
        userId,
        ownerType: "user",
      },
    }
  );
};

export async function POST(request) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  if (!authResult.user.isGuest) {
    return NextResponse.json(
      { error: "Only guest sessions can be upgraded" },
      { status: 400 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  try {
    const { todoCollection, usersCollection } = await getCollections();
    const result = await createRegisteredUser({
      usersCollection,
      userPayload: body,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { user, userId, token } = result;

    await migrateGuestTodosToUser({
      todoCollection,
      guestUserId: authResult.user._id,
      userId,
    });

    await usersCollection.deleteOne({ _id: authResult.user._id });

    const response = NextResponse.json(
      {
        token,
        _id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      { status: 201 }
    );
    response.headers.set("Authorization", `Bearer ${token}`);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to upgrade guest user" }, { status: 500 });
  }
}
