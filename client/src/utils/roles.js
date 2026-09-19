/** Home route for a given role. Unknown / missing role falls back to the public home. */
export function getRoleHome(role) {
  if (role === 'PATIENT') return '/patient'
  if (role === 'INSURER') return '/insurer'
  return '/'
}