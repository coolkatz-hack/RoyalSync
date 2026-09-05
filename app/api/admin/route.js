const adminApiUrl = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;

async function forwardRequest(request) {
  if (!adminApiUrl) {
    return Response.json({ message: "ADMIN_API_URL is not configured." }, { status: 500 });
  }

  const url = new URL(request.url);
  const target = `${adminApiUrl}${url.search}`;
  const role = request.headers.get("x-user-role") || "";
  const options = {
    method: request.method,
    headers: { "X-User-Role": role },
  };

  if (request.method === "POST") {
    options.headers["Content-Type"] = "application/json";
    options.body = await request.text();
  }

  const response = await fetch(target, { ...options, cache: "no-store" });
  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
  });
}

export async function GET(request) {
  try {
    return await forwardRequest(request);
  } catch (error) {
    return Response.json({ message: error.message || "AWS Admin Lambda is unavailable." }, { status: 502 });
  }
}

export async function POST(request) {
  try {
    return await forwardRequest(request);
  } catch (error) {
    return Response.json({ message: error.message || "AWS Admin Lambda is unavailable." }, { status: 502 });
  }
}