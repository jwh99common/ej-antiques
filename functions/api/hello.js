// Example API function - accessible at /api/hello
export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    message: "Hello from ej-antiques!",
    timestamp: new Date().toISOString()
  }), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
