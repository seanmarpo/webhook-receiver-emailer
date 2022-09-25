addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function readRequestBody(request) {
    // Parse POST body and attempt to make sense of what we got
    const { headers } = request;
    const contentType = headers.get('content-type') || '';
    
    // JSON
    if (contentType.includes('application/json')) {
        return JSON.stringify(await request.json());
    // Plain text
    } else if (contentType.includes('application/text') || contentType.includes('text/plain')) {
        return request.text();
    // HTML, oh god why?!
    } else if (contentType.includes('text/html')) {
        return request.text();
    // x-www-urlformencoded (standard key=value POST format)
    } else if (contentType.includes('form')) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
        body[entry[0]] = entry[1];
        }
        return JSON.stringify(body);
    // Got a file, binary, or something we don't recognize -- return default text
    } else {
        return 'Undetermined binary data was sent';
    }
    
  }
 
async function handleRequest(request) {
    // Confirm request is POST and confirm Authorization matches secret token
    if (request.method != "POST" || request.headers.get('Authorization') != TOKEN) {
        return new Response("Unauthorized", {status: 403});
    }

    // Parse the request
	const { searchParams } = new URL(request.url)
	let subject = searchParams.get('subject') || "New Email Alert";
    let params = await readRequestBody(request);

    // Free email service provided by MailChannels
    // Ref: https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels/
    let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
        "method": "POST",
        "headers": {
            "content-type": "application/json",
        },
        "body": JSON.stringify({
            "personalizations": [
                { "to": [ {"email": TO_EMAIL,
                        "name": TO_NAME || ""}]}
            ],
            "from": {
                "email": FROM_EMAIL,
                "name": FROM_NAME || "",
            },
            "subject": subject,
            "content": [{
                "type": "text/plain",
                "value": "Alert received:\n\n" + params,
            }],
        }),
    });
 
    let respContent = "";
    const resp = await fetch(send_request);
    const respText = await resp.text();
    respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

    return new Response(respContent, {status: resp.status});
}
