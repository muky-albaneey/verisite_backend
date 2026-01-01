/**
 * User Status - Frontend contract
 */
export enum ApiUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
}

/**
 * User Status - DB enum
 */
export enum DbUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

/**
 * Project Status - Frontend contract
 */
export enum ApiProjectStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  PENDING_REVIEW = 'Pending review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

/**
 * Project Status - DB enum
 */
export enum DbProjectStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Developer Acceptance Status - Frontend contract
 */
export enum ApiDeveloperAcceptanceStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

/**
 * Developer Acceptance Status - DB enum
 */
export enum DbDeveloperAcceptanceStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * Assignment Status - Frontend contract
 */
export enum ApiAssignmentStatus {
  COMPLETED = 'Completed',
  ONGOING = 'Ongoing',
  PENDING = 'Pending',
}

/**
 * Assignment Status - DB enum
 */
export enum DbAssignmentStatus {
  COMPLETED = 'COMPLETED',
  ONGOING = 'ONGOING',
  PENDING = 'PENDING',
}

/**
 * Report Status - Frontend contract
 */
export enum ApiReportStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under-review',
}

/**
 * Report Status - DB enum
 */
export enum DbReportStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
  FLAGGED = 'FLAGGED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

/**
 * Milestone Status - Frontend contract
 */
export enum ApiMilestoneStatus {
  COMPLETED = 'completed',
  ONGOING = 'ongoing',
  PENDING = 'pending',
}

/**
 * Milestone Status - DB enum
 */
export enum DbMilestoneStatus {
  COMPLETED = 'COMPLETED',
  ONGOING = 'ONGOING',
  PENDING = 'PENDING',
}

/**
 * Escrow Status - Frontend contract
 */
export enum ApiEscrowStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

/**
 * Escrow Status - DB enum
 */
export enum DbEscrowStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

