/**
 * Frontend contract: Role values returned to clients
 */
export enum ApiRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  FIELD_OPS = 'FIELD_OPS',
  DEVELOPER = 'DEVELOPER',
  CLIENT = 'CLIENT',
}

/**
 * Internal DB enum (canonical form)
 */
export enum DbRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  FIELD_OPS = 'FIELD_OPS',
  DEVELOPER = 'DEVELOPER',
  CLIENT = 'CLIENT',
}

