import { NextResponse } from "next/server";
import { getAuthUser } from "../../../lib/api/auth";
import { getCollections, ObjectId } from "../../../lib/api/db";
import { getTodoFilter } from "../../../lib/api/todos";
import { validateChatPayload } from "../../../lib/api/validation";
import { AiServiceUnavailableError, getGuidance } from "../../../lib/api/ai-service";

export const runtime = "nodejs";

const GUEST_AI_REQUEST_LIMIT = 3;

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

  const validationError = validateChatPayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { message, todoId } = body;

  if (!ObjectId.isValid(todoId)) {
    return NextResponse.json({ error: "Invalid todo id" }, { status: 400 });
  }

  try {
    const { todoCollection, usersCollection } = await getCollections();

    if (authResult.user.isGuest) {
      const usageRecord = await usersCollection.findOne({ _id: authResult.user._id });
      const requestsUsed = Number.isInteger(usageRecord?.guestAiRequestsUsed)
        ? usageRecord.guestAiRequestsUsed
        : 0;

      if (requestsUsed >= GUEST_AI_REQUEST_LIMIT) {
        return NextResponse.json(
          {
            error:
              "Guest limit reached. Please sign up to continue using AI guidance.",
            code: "GUEST_LIMIT_REACHED",
            limit: GUEST_AI_REQUEST_LIMIT,
          },
          { status: 403 }
        );
      }
    }

    const todo = await todoCollection.findOne(
      getTodoFilter(todoId, authResult.user._id, ObjectId)
    );

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const guidance = await getGuidance({
      todoTitle: todo.title,
      userMessage: message,
    });
    const assistantGuidance = {
      ...guidance,
      generatedAt: new Date().toISOString(),
    };

    await todoCollection.updateOne(
      getTodoFilter(todoId, authResult.user._id, ObjectId),
      {
        $set: {
          assistantGuidance,
        },
      }
    );

    if (authResult.user.isGuest) {
      await usersCollection.updateOne(
        { _id: authResult.user._id },
        { $inc: { guestAiRequestsUsed: 1 } },
        { upsert: true }
      );

      const updatedUsageRecord = await usersCollection.findOne({
        _id: authResult.user._id,
      });

      const requestsUsed = Number.isInteger(updatedUsageRecord?.guestAiRequestsUsed)
        ? updatedUsageRecord.guestAiRequestsUsed
        : 1;
      const requestsRemaining = Math.max(GUEST_AI_REQUEST_LIMIT - requestsUsed, 0);

      return NextResponse.json(
        {
          ...assistantGuidance,
          guestUsage: {
            limit: GUEST_AI_REQUEST_LIMIT,
            used: requestsUsed,
            remaining: requestsRemaining,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(assistantGuidance, { status: 200 });
  } catch (error) {
    if (error instanceof AiServiceUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error(error);
    return NextResponse.json({ error: "Error processing the AI request" }, { status: 500 });
  }
}
