export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return new Response("Got the app!!!", {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}
