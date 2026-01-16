import { NextApiRequest } from 'next';
import { getAuthenticatedUser } from './auth';

// Single superadmin identified by hardcoded email per requirements
const SUPERADMIN_EMAIL = 'admin@redbrickhacks.co';

export function isSuperadmin(email: string | null | undefined): boolean {
  return email === SUPERADMIN_EMAIL;
}

export async function getSuperadminUser(req: NextApiRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || !isSuperadmin(user.email)) {
    return null;
  }
  return user;
}
