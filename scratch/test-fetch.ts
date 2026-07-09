async function main() {
  console.log("Fetching API messages endpoint from running dev server...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/mensajes", {
      headers: {
        // We do not pass cookie, so it should return 401 Unauthorized
      }
    });
    console.log("Response Status:", res.status);
    console.log("Response OK:", res.ok);
    const body = await res.text();
    console.log("Response Body:", body);
  } catch (error: any) {
    console.error("Fetch failed:", error.message || error);
  }
}

main();
