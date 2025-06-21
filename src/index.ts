export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello from worker-invoice! This is your Cloudflare Worker API endpoint.", {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
