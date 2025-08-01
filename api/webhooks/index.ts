import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to create a JSON response with logging
function jsonResponse(status: number, body: any, method: string, pathname: string): any {
    const bodyStr = JSON.stringify(body);
    console.log(`[RESPONSE] ${method} ${pathname} - Status: ${status}, Body: ${bodyStr}`);
    return { status, body };
}

// Helper for responses with no content (e.g., 204 No Content, 202 Accepted)
function noContentResponse(method: string, pathname: string, status: number = 204): any {
    console.log(`[RESPONSE] ${method} ${pathname} - Status: ${status}, Body: (empty)`);
    return { status, body: null };
}

function convertLocalYYYYMMDDHHmmToUTC(localDateTimeStr: string): string {
    const year = parseInt(localDateTimeStr.substring(0, 4), 10);
    const month = parseInt(localDateTimeStr.substring(4, 6), 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(localDateTimeStr.substring(6, 8), 10);
    const hour = parseInt(localDateTimeStr.substring(8, 10), 10);
    const minute = parseInt(localDateTimeStr.substring(10, 12), 10);

    const localDate = new Date(year, month, day, hour, minute);

    const utcYear = localDate.getUTCFullYear();
    const utcMonth = (localDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, add 1 back
    const utcDay = localDate.getUTCDate().toString().padStart(2, '0');
    const utcHour = localDate.getUTCHours().toString().padStart(2, '0');
    const utcMinute = localDate.getUTCMinutes().toString().padStart(2, '0');

    return `${utcYear}${utcMonth}${utcDay}${utcHour}${utcMinute}`;
}

async function getWebhooks(req: VercelRequest, url: URL): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error("X_BEARER_TOKEN not found in environment variables.");
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'GET', url.pathname);
    }
    try {
        const twitterApiUrl = "https://api.twitter.com/2/webhooks";
        const response = await fetch(twitterApiUrl, {
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json(); // Assuming Twitter API always returns JSON or this will throw
        if (!response.ok) {
            console.error(`Twitter API GET Error: ${response.status} ${response.statusText}`, data);
            return jsonResponse(response.status, { error: "Failed to fetch data from Twitter API.", details: data }, req.method || 'GET', url.pathname);
        }
        return jsonResponse(200, data, req.method || 'GET', url.pathname);
    } catch (error) {
        console.error("Error fetching from Twitter API (GET /webhooks):", error);
        return jsonResponse(500, { error: "Internal server error while fetching from Twitter API." }, req.method || 'GET', url.pathname);
    }
}

async function createWebhook(req: VercelRequest, url: URL): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error("X_BEARER_TOKEN not found for POST /api/webhooks.");
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'POST', url.pathname);
    }
    try {
        const body = req.body as { url?: string };
        if (!body.url || typeof body.url !== 'string') {
            return jsonResponse(400, { error: "Invalid request body: 'url' is required and must be a string." }, req.method || 'POST', url.pathname);
        }
        const twitterApiUrl = "https://api.twitter.com/2/webhooks";
        const response = await fetch(twitterApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: body.url }),
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error(`Twitter API POST Error: ${response.status}`, responseData);
            // Forward Twitter's error response directly, as it contains useful details
            return jsonResponse(response.status, responseData, req.method || 'POST', url.pathname);
        }
        return jsonResponse(response.status, responseData, req.method || 'POST', url.pathname); // Usually 201
    } catch (error) {
        let errorBody = { error: "Internal server error while creating webhook." };
        let errorStatus = 500;
        if (error instanceof SyntaxError && req.headers["content-type"]?.includes("application/json")) {
            errorBody = { error: "Invalid JSON payload." };
            errorStatus = 400;
        }
        console.error("Error creating webhook via Twitter API (POST /webhooks):", error);
        return jsonResponse(errorStatus, errorBody, req.method || 'POST', url.pathname);
    }
}

async function validateWebhook(req: VercelRequest, url: URL, webhookId: string): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error("X_BEARER_TOKEN not found for PUT /api/webhooks/:id.");
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'PUT', url.pathname);
    }
    try {
        const twitterApiUrl = `https://api.twitter.com/2/webhooks/${webhookId}`;
        console.log(`[DEBUG] Sending PUT to Twitter API: ${twitterApiUrl}`);
        const response = await fetch(twitterApiUrl, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${bearerToken}` },
        });
        if (!response.ok) {
            let errorDetails = `Failed to send validation request for webhook ${webhookId}.`;
            let errorDataForClient = { error: "Twitter API Error during validation request.", details: errorDetails };
            try {
                const twitterErrorData = await response.json() as any;
                errorDetails = twitterErrorData.title || twitterErrorData.detail || JSON.stringify(twitterErrorData);
                errorDataForClient.details = twitterErrorData;
            } catch (e) {
                const textDetails = await response.text();
                errorDetails = textDetails || response.statusText;
                errorDataForClient.details = errorDetails;
            }
            console.error(`Twitter API PUT Error: ${response.status}`, errorDetails);
            return jsonResponse(response.status, errorDataForClient, req.method || 'PUT', url.pathname);
        }
        return noContentResponse(req.method || 'PUT', url.pathname); // 204 No Content
    } catch (error) {
        console.error("Error sending validation request via Twitter API (PUT /webhooks/:id):", error);
        return jsonResponse(500, { error: "Internal server error while sending validation request." }, req.method || 'PUT', url.pathname);
    }
}

async function deleteWebhook(req: VercelRequest, url: URL, webhookId: string): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error("X_BEARER_TOKEN not found for DELETE /api/webhooks/:id.");
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'DELETE', url.pathname);
    }
    try {
        const twitterApiUrl = `https://api.twitter.com/2/webhooks/${webhookId}`;
        const response = await fetch(twitterApiUrl, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${bearerToken}` },
        });
        if (!response.ok) {
            let errorDetails = `Failed to delete webhook ${webhookId}.`;
            let errorDataForClient = { error: "Failed to delete webhook from Twitter API.", details: errorDetails };
            try {
                const twitterErrorData = await response.json() as any;
                errorDetails = twitterErrorData.title || twitterErrorData.detail || JSON.stringify(twitterErrorData);
                errorDataForClient.details = twitterErrorData;
            } catch (e) {
                const textDetails = await response.text();
                errorDetails = textDetails || response.statusText;
                errorDataForClient.details = errorDetails;
            }
            console.error(`Twitter API DELETE Error: ${response.status}`, errorDetails);
            return jsonResponse(response.status, errorDataForClient, req.method || 'DELETE', url.pathname);
        }
        return noContentResponse(req.method || 'DELETE', url.pathname); // 204 No Content
    } catch (error) {
        console.error("Error deleting webhook via Twitter API (DELETE /webhooks/:id):", error);
        return jsonResponse(500, { error: "Internal server error while deleting webhook." }, req.method || 'DELETE', url.pathname);
    }
}

async function replayWebhookEvents(req: VercelRequest, url: URL, webhookId: string): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error(`X_BEARER_TOKEN not found for POST /api/webhooks/${webhookId}/replay.`);
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'POST', url.pathname);
    }

    try {
        const from_date = url.searchParams.get('from_date');
        const to_date = url.searchParams.get('to_date');

        if (!from_date || typeof from_date !== 'string' || !to_date || typeof to_date !== 'string') {
            return jsonResponse(400, { error: "Invalid query parameters: 'from_date' and 'to_date' are required strings in YYYYMMDDHHmm format representing local time." }, req.method || 'POST', url.pathname);
        }
        
        // Basic validation for YYYYMMDDHHmm format (length 12, all digits)
        if (from_date.length !== 12 || !/^[0-9]+$/.test(from_date) || to_date.length !== 12 || !/^[0-9]+$/.test(to_date)) {
            return jsonResponse(400, { error: "Invalid date format in query parameters: 'from_date' and 'to_date' must be in YYYYMMDDHHmm format representing local time." }, req.method || 'POST', url.pathname);
        }

        const from_date_utc = convertLocalYYYYMMDDHHmmToUTC(from_date);
        const to_date_utc = convertLocalYYYYMMDDHHmmToUTC(to_date);

        const twitterApiUrl = `https://api.twitter.com/2/account_activity/replay/webhooks/${webhookId}/subscriptions/all?from_date=${from_date_utc}&to_date=${to_date_utc}`;
        console.log(`[DEBUG] Sending POST to X API for replay: ${twitterApiUrl} (UTC times) from local inputs: from=${from_date}, to=${to_date}`);

        const response = await fetch(twitterApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                // Content-Type is not needed for POST with query parameters and no body
            },
            // No body for this request as parameters are in URL
        });

        interface XReplaySuccessResponse {
            data: {
                job_id: string;
                created_at: string;
            };
        }

        if (response.status === 200) { // OK
            const responseData = await response.json() as XReplaySuccessResponse;
            console.log(`[DEBUG] X API Replay request successful for webhook ${webhookId}. Job ID: ${responseData?.data?.job_id}`);
            return jsonResponse(200, responseData, req.method || 'POST', url.pathname); // Forward X API's response
        }
        
        // Handle X API errors
        let errorDetails = `Failed to request replay for webhook ${webhookId}.`;
        let errorDataForClient = { error: "X API Error during replay request.", details: errorDetails };
        try {
            const twitterErrorData = await response.json() as any;
            errorDetails = twitterErrorData.title || twitterErrorData.detail || JSON.stringify(twitterErrorData);
            errorDataForClient.details = twitterErrorData; // Send the whole X error object
        } catch (e) {
            const textDetails = await response.text();
            errorDetails = textDetails || response.statusText;
            errorDataForClient.details = errorDetails;
        }
        console.error(`X API Replay Error: ${response.status}`, errorDetails);
        return jsonResponse(response.status, errorDataForClient, req.method || 'POST', url.pathname);

    } catch (error) {
        // No SyntaxError check needed here as we are not parsing a request body
        console.error("Error processing replay request (POST /api/webhooks/:id/replay):", error);
        return jsonResponse(500, { error: "Internal server error while requesting event replay." }, req.method || 'POST', url.pathname);
    }
}

// Subscription functions
async function getWebhookSubscriptions(req: VercelRequest, url: URL, webhookId: string): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN; // This API uses Bearer Token
    if (!bearerToken) {
        console.error(`X_BEARER_TOKEN not found for GET /api/webhooks/${webhookId}/subscriptions.`);
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'GET', url.pathname);
    }
    try {
        const twitterApiUrl = `https://api.twitter.com/2/account_activity/webhooks/${webhookId}/subscriptions/all/list`;
        console.log(`[DEBUG] Fetching subscriptions from Twitter API: ${twitterApiUrl}`);
        const response = await fetch(twitterApiUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
        });
        const twitterResponseData = await response.json() as any; 
        if (!response.ok) {
            console.error(`Twitter API GET Subscriptions Error: ${response.status} ${response.statusText}`, twitterResponseData);
            return jsonResponse(response.status, { error: "Failed to fetch subscriptions from Twitter API.", details: twitterResponseData }, req.method || 'GET', url.pathname);
        }

        let subscriptions = [];
        if (twitterResponseData && twitterResponseData.data && Array.isArray(twitterResponseData.data.subscriptions)) {
            subscriptions = twitterResponseData.data.subscriptions.map((sub: { user_id: string }) => ({ id: sub.user_id }));
        } else {
            console.warn("Twitter API GET Subscriptions: Response structure was not as expected or no subscriptions array.", twitterResponseData);
        }
        
        return jsonResponse(200, { data: subscriptions, meta: { result_count: subscriptions.length } }, req.method || 'GET', url.pathname);

    } catch (error) {
        console.error(`Error fetching subscriptions for webhook ${webhookId} from Twitter API:`, error);
        return jsonResponse(500, { error: "Internal server error while fetching subscriptions." }, req.method || 'GET', url.pathname);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[WEBHOOK_API] ${req.method} ${url.pathname}`);

    // Handle webhook-specific subscription endpoints
    const pathParts = url.pathname.split('/');
    if (pathParts.length >= 4 && pathParts[3] === 'subscriptions') {
      const webhookId = pathParts[2];
      const userId = pathParts[4]; // Optional, for specific user subscription

      // GET subscriptions for a webhook
      if (req.method === 'GET' && !userId) {
        const result = await getWebhookSubscriptions(req, url, webhookId);
        return res.status(result.status).json(result.body);
      }

      // TODO: Add POST and DELETE subscription handlers here
      // For now, return not implemented
      return res.status(501).json({ error: 'Subscription management not yet implemented' });
    }

    // Handle replay endpoint
    const replayMatch = url.pathname.match(/^\/api\/webhooks\/([a-zA-Z0-9_]+)\/replay$/);
    if (replayMatch && req.method === 'POST') {
      const webhookId = replayMatch[1];
      if (typeof webhookId === 'string') {
        const result = await replayWebhookEvents(req, url, webhookId);
        return res.status(result.status).json(result.body);
      }
      return res.status(400).json({ error: "Invalid webhook ID in path for replay." });
    }

    // GET - Return list of webhooks
    if (req.method === 'GET') {
      const result = await getWebhooks(req, url);
      return res.status(result.status).json(result.body);
    }

    // POST - Create new webhook
    if (req.method === 'POST') {
      const result = await createWebhook(req, url);
      return res.status(result.status).json(result.body);
    }

    // PUT - Validate webhook
    if (req.method === 'PUT') {
      const webhookId = pathParts[3];
      if (webhookId) {
        const result = await validateWebhook(req, url, webhookId);
        if (result.body === null) {
          return res.status(result.status).send('');
        }
        return res.status(result.status).json(result.body);
      }
    }

    // DELETE - Delete webhook
    if (req.method === 'DELETE') {
      const webhookId = pathParts[3];
      if (webhookId) {
        const result = await deleteWebhook(req, url, webhookId);
        if (result.body === null) {
          return res.status(result.status).send('');
        }
        return res.status(result.status).json(result.body);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[WEBHOOK_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 