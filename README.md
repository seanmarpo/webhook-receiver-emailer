# (Cloudflare Worker) Webhook Receiver and Email Alerter
It's an overly complicated name, I know, but it best describes my particular use-case.

## About
This is a simple [Cloudflare Worker](https://workers.cloudflare.com/) which accepts a POST request, parses the body of the request, and then ships off an email to the associated address whenever a request is received with the parsed body.

**TL;DR -- This is a FREE webhook receiver and email alerter for received events.**

## Why
A lot of self-hosted services require a local SMTP server which is a pain-in-the-butt and also requires leaving email credentials laying around.

Webhooks are simple, generally widely supported, and only require internet access. This simple system allows anything that can make a POST request the ability to generate an email alert (eg. Jellyfin server, RAID array status updates, etc).

## Setup
_You will need the Cloudflare Workers CLI setup, so follow the guide here: [https://developers.cloudflare.com/workers/#installing-the-workers-cli](https://developers.cloudflare.com/workers/#installing-the-workers-cli)_

1. Clone the repo down
```
git clone git@github.com:seanmarpo/webhook-receiver-emailer.git
```
2. Change into the repo directory
```
cd webhook-receiver-emailer
```
3. Update `wrangler.toml` with your specific variables
4. Set the `TOKEN` secret value in Cloudflare Workers (Required to include this token in all requests)
```
wrangler secret put TOKEN
```
5. Publish the worker to Cloudflare
```
wrangler publish
```
6. Test that everything is working (fill in your workers subdomain and secret TOKEN value)
```
curl -XPOST https://emailer.<SUBDOMAIN>.workers.dev\?subject\=Test+Email -d 'test=something' -H 'Authorization: <TOKEN>'
``` 

## Advanced Setup Info
### `wrangler.toml` details
| Variable   | Description                                |
|------------|--------------------------------------------|
| TO_EMAIL   | Email address to send notification to      |
| TO_NAME    | Email display name to use for recipient    |
| FROM_EMAIL | Email address notification is from         |
| FROM_NAME  | Email display name to use for notification |

### Secret token details
A shared-secret is configured to stop anyone from abusing the worker endpoint as you only get so many free invocations per month.

We use Cloudflare Workers "secrets" to store the shared secret and ensure it's not placed in a flat file.

You need to supply the `TOKEN` as the `Authorization` header in requests. eg. `Authorization: secret` otherwise you will receive a 403.