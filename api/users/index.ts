import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to create a JSON response with logging
function jsonResponse(status: number, body: any, method: string, pathname: string): any {
    const bodyStr = JSON.stringify(body);
    console.log(`[USER_API_RESPONSE] ${method} ${pathname} - Status: ${status}, Body: ${bodyStr}`);
    return { status, body };
}

async function getUserDetails(req: VercelRequest, url: URL, userId: string): Promise<any> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
        console.error(`X_BEARER_TOKEN not found for GET /api/users/${userId}.`);
        return jsonResponse(500, { error: "Server configuration error: Missing API token." }, req.method || 'GET', url.pathname);
    }

    const twitterApiUrl = `https://api.twitter.com/2/users/${userId}?user.fields=profile_image_url`;
    console.log(`[DEBUG] Fetching user details from Twitter API: ${twitterApiUrl}`);

    try {
        const response = await fetch(twitterApiUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
            },
        });
        const responseData = await response.json(); 
        if (!response.ok) {
            console.error(`Twitter API GET User Details Error for ID ${userId}: ${response.status} ${response.statusText}`, responseData);
            return jsonResponse(response.status, { error: "Failed to fetch user details from Twitter API.", details: responseData }, req.method || 'GET', url.pathname);
        }
        // The responseData should be in the format: { data: { id, name, username, profile_image_url } }
        return jsonResponse(200, responseData, req.method || 'GET', url.pathname);
    } catch (error) {
        console.error(`Error fetching user details for ID ${userId} from Twitter API:`, error);
        return jsonResponse(500, { error: "Internal server error while fetching user details." }, req.method || 'GET', url.pathname);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[USER_API] ${req.method} ${url.pathname}`);

    // Extract user ID from path
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    // GET - Return user data
    if (req.method === 'GET') {
      if (userId && userId !== 'users') {
        const result = await getUserDetails(req, url, userId);
        return res.status(result.status).json(result.body);
      } else {
        // Return error for list users endpoint (not implemented)
        return res.status(501).json({ 
          error: 'List users endpoint not implemented',
          message: 'Use /api/users/{userId} to get specific user details'
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[USER_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 