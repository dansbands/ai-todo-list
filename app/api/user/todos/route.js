import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/api/auth";
import { getCollections } from "../../../../lib/api/db";
import { isPlainObject } from "../../../../lib/api/validation";
import { serializeTodo } from "../../../../lib/api/todos";

export const runtime = "nodejs";

export async function POST(request) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  let body = {};

  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  if (isPlainObject(body) && Object.keys(body).length > 0) {
    return NextResponse.json(
      { error: "This endpoint does not accept a request body" },
      { status: 400 }
    );
  }

  try {
    const { todoCollection } = await getCollections();
    const todos = await todoCollection
      .find({ userId: authResult.user._id })
      .sort({ _id: -1 })
      .toArray();

    return NextResponse.json({ todos: todos.map(serializeTodo) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch todos" }, { status: 500 });
  }
}
