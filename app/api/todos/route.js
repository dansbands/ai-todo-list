import { NextResponse } from "next/server";
import { getAuthUser } from "../../../lib/api/auth";
import { getCollections } from "../../../lib/api/db";
import { serializeTodo } from "../../../lib/api/todos";
import { validateTodoCreatePayload } from "../../../lib/api/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
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

export async function POST(request) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  const validationError = validateTodoCreatePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { todoCollection } = await getCollections();
    const todo = {
      title: body.title.trim(),
      completed: body.completed,
      userId: authResult.user._id,
      ownerType: authResult.user.isGuest ? "guest" : "user",
    };

    const result = await todoCollection.insertOne(todo);
    const createdTodo = await todoCollection.findOne({
      _id: result.insertedId,
      userId: authResult.user._id,
    });

    if (!createdTodo) {
      console.error("Todo created but could not be retrieved", {
        insertedId: result.insertedId,
        userId: authResult.user._id,
      });
      return NextResponse.json({ error: "Unable to create todo" }, { status: 500 });
    }

    return NextResponse.json({ todo: serializeTodo(createdTodo) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create todo" }, { status: 500 });
  }
}
