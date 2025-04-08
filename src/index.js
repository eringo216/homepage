/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
        const baseURL = new URL("https://raw.githubusercontent.com/eringo216/homepage/master/public")

        console.log(`Request URL: ${url}`);
        if (!url.pathname.startsWith('/resource')) {
            if(url.pathname == "/"){
                url.pathname = "/top"
            }
            const resource = await fetch(`${baseURL}/resource${url.pathname}/index.html`);
            console.log("fetching:",`${baseURL}/resource${url.pathname}/index.html`)
            if (resource.ok) {
                console.log(`Resource find: ${url.pathname}`);
                if (!resource.headers.get('content-type')?.includes('text/html')) {
                    //return resource;
                }

                const resourceText = await resource.text();
                const template = await fetch(`${baseURL}/template.html`).then((res) => {
                    return res.text();
                });

                let body = template.replace('${body}', resourceText).replace(/\${baseURL}/g, baseURL);
                const titleRegexp = resourceText.match(/\${title}="(.+?)"/);
                if (titleRegexp) {
                    body = body.replace('${title}', titleRegexp[1]);
                } else {
                    body = body.replace('${title}', 'unknown');
                }

                return new Response(body, {
                    headers: {
                        'Content-Type': 'text/html',
                    },
                });
            } else {
                console.log("resource not found:",url.pathname)
            }
            console.log(resource);
        }

        return new Response("ざんねん!404でしたー もどるボタンおしてね", { status: 404 });
    },
}