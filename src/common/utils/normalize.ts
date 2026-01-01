/**
 * Normalize string: trim, lowercase, replace dashes/underscores with spaces
 */
export function normalizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize role input (accept aliases)
 */
export function normalizeRole(input: string): string {
  const normalized = normalizeString(input);
  
  // Map aliases to canonical values
  const roleMap: Record<string, string> = {
    'customer': 'CLIENT',
    'client': 'CLIENT',
    'field operator': 'FIELD_OPS',
    'field ops': 'FIELD_OPS',
    'fieldops': 'FIELD_OPS',
    'project manager': 'PROJECT_MANAGER',
    'projectmanager': 'PROJECT_MANAGER',
    'developer': 'DEVELOPER',
    'admin': 'ADMIN',
  };

  return roleMap[normalized] || input.toUpperCase();
}

