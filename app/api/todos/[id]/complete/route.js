import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../../lib/api/auth";
import { getCollections, ObjectId } from "../../../../../lib/api/db";
import { getTodoFilter, serializeTodo } from "../../../../../lib/api/todos";
import { validateTodoCompletePayload } from "../../../../../lib/api/validation";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
  }

  let body;

  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  const validationError = validateTodoCompletePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { todoCollection } = await getCollections();
    const filter = getTodoFilter(params.id, authResult.user._id, ObjectId);
    const result = await todoCollection.updateOne(filter, {
      $set: {
        completed: body.completed,
      },
    });

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const updatedTodo = await todoCollection.findOne(filter);

    if (!updatedTodo) {
      console.error("Todo completion updated but could not be retrieved", {
        todoId: params.id,
        userId: authResult.user._id,
      });
      return NextResponse.json({ error: "Unable to update todo" }, { status: 500 });
    }

    return NextResponse.json({ todo: serializeTodo(updatedTodo) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update todo" }, { status: 500 });
  }
}
