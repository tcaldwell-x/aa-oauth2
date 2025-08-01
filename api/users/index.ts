import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define user type
interface User {
  id: string;
  username: string;
  screen_name: string;
  profile_image_url: string;
  verified: boolean;
  followers_count: number;
  friends_count: number;
}

// Mock user data for testing
const mockUsers: Record<string, User> = {
  '123': {
    id: '123',
    username: 'testuser',
    screen_name: 'Test User',
    profile_image_url: 'https://via.placeholder.com/48x48',
    verified: false,
    followers_count: 150,
    friends_count: 75
  },
  '456': {
    id: '456', 
    username: 'demoaccount',
    screen_name: 'Demo Account',
    profile_image_url: 'https://via.placeholder.com/48x48',
    verified: true,
    followers_count: 1250,
    friends_count: 300
  }
};

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
        const user = mockUsers[userId];
        if (user) {
          return res.status(200).json({ 
            data: user,
            message: 'User retrieved successfully',
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(404).json({ 
            error: 'User not found',
            details: `User with ID ${userId} does not exist`
          });
        }
      } else {
        // Return list of users
        return res.status(200).json({ 
          data: Object.values(mockUsers),
          message: 'Users retrieved successfully',
          timestamp: new Date().toISOString()
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