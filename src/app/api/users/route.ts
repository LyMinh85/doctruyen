export async function POST() {
  return new Response(
    JSON.stringify({
      message: "This is a POST request",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
