/**
 * Role assignments — map email → role
 * Roles are exposed as window.userRole for DAP tools (WalkMe, Glide, etc.)
 *
 * To add/change: edit the ROLE_MAP below, then rebuild & deploy.
 */

export const ROLES = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  USER:    'user',
  GUEST:   'guest',
};

// email (lowercase) → role
export const ROLE_MAP = {
  'olkuznetsov.mail@gmail.com': ROLES.ADMIN,
  'golyasova@gmail.com':        ROLES.MANAGER,
};

export const DEFAULT_ROLE = ROLES.GUEST;

/**
 * Returns the role for a given email.
 * Falls back to DEFAULT_ROLE if not found.
 */
export function getRoleForEmail(email) {
  if (!email) return DEFAULT_ROLE;
  return ROLE_MAP[email.toLowerCase()] ?? ROLES.USER;
}
