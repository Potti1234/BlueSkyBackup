export const BLUESKY_CONFIG = {
  // Replace these with your app's credentials from https://bsky.app/settings/app-passwords
  client_id: process.env.NEXT_PUBLIC_BLUESKY_CLIENT_ID || '',
  client_secret: process.env.BLUESKY_CLIENT_SECRET || '',
  redirect_uri: process.env.NEXT_PUBLIC_BLUESKY_REDIRECT_URI || 'http://localhost:3000/callback',
  service: 'https://bsky.social',
  authEndpoint: 'https://bsky.social/xrpc/com.atproto.server.createSession'
} 