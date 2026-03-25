export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    app: "Morla Coffee Shop",
    source: "next",
  });
}
