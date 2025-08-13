export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const baseURL = new URL("https://raw.githubusercontent.com/eringo216/homepage/master/public");
  
      // プロキシ機能追加
      if (url.pathname === "/proxy") {
        const target = url.searchParams.get("url");
        if (!target) {
          return new Response("Missing ?url= parameter", { status: 400 });
        }
  
        try {
          const proxied = await fetch(target, {
            method: request.method,
            headers: request.headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
          });
  
          const newHeaders = new Headers(proxied.headers);
          newHeaders.set("Access-Control-Allow-Origin", "*");
          newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          newHeaders.set("Access-Control-Allow-Headers", "*");
  
          return new Response(proxied.body, {
            status: proxied.status,
            statusText: proxied.statusText,
            headers: newHeaders,
          });
        } catch (e) {
          return new Response("Proxy error: " + e.message, { status: 502 });
        }
      }
  
      // 通常のルーティング処理
      if (!url.pathname.startsWith('/resource')) {
        if (url.pathname === "/") {
          url.pathname = "/top";
        }
  
        const resource = await fetch(`${baseURL}/resource${url.pathname}/index.html`);
        if (resource.ok) {
          const resourceText = await resource.text();
          const template = await fetch(`${baseURL}/template.html`).then(res => res.text());
  
          let body = template.replace('${body}', resourceText).replace(/\${baseURL}/g, baseURL);
          const titleRegexp = resourceText.match(/\${title}="(.+?)"/);
          if (titleRegexp) {
            body = body.replace('${title}', titleRegexp[1]);
          } else {
            body = body.replace('${title}', 'unknown');
          }
  
          return new Response(body, {
            headers: { 'Content-Type': 'text/html' },
          });
        }
  
        return new Response("404 (´・ω・`)<ページがないよ", { status: 404 });
      }
  
      return new Response("404 (´・ω・`)<ページがないよ", { status: 404 });
    },
  };
  