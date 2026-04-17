import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/api/auth";
import { getCollections, ObjectId } from "../../../../lib/api/db";
import { getTodoFilter } from "../../../../lib/api/todos";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const authResult = getAuthUser(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
  }

  try {
    const { todoCollection } = await getCollections();
    const result = await todoCollection.deleteOne(
      getTodoFilter(params.id, authResult.user._id, ObjectId)
    );

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ deletedId: params.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete todo" }, { status: 500 });
  }
}
