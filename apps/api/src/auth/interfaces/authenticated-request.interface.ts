import type { Request } from 'express';

// Identity established by the verified access token.
export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}

// Express request extended with our authenticated identity.
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
