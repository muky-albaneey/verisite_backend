import {
  ApiRole,
  DbRole,
  ApiUserStatus,
  DbUserStatus,
  ApiProjectStatus,
  DbProjectStatus,
  ApiDeveloperAcceptanceStatus,
  DbDeveloperAcceptanceStatus,
  ApiAssignmentStatus,
  DbAssignmentStatus,
  ApiReportStatus,
  DbReportStatus,
  ApiMilestoneStatus,
  DbMilestoneStatus,
  ApiMilestoneName,
  DbMilestoneName,
  ApiMediaType,
  DbMediaType,
  ApiNotificationType,
  DbNotificationType,
  ApiTransactionStatus,
  DbTransactionStatus,
  ApiTransactionType,
  DbTransactionType,
  ApiEscrowStatus,
  DbEscrowStatus,
  ApiConstructionType,
  DbConstructionType,
} from '../../contracts';
import { normalizeString, normalizeRole } from './normalize';

// Role mapping
export function toApiRole(dbValue: DbRole | string): ApiRole {
  const map: Record<string, ApiRole> = {
    ADMIN: ApiRole.ADMIN,
    PROJECT_MANAGER: ApiRole.PROJECT_MANAGER,
    FIELD_OPS: ApiRole.FIELD_OPS,
    DEVELOPER: ApiRole.DEVELOPER,
    CLIENT: ApiRole.CLIENT,
  };
  return map[dbValue] || (dbValue as ApiRole);
}

export function toDbRole(apiValue: string): DbRole {
  const normalized = normalizeRole(apiValue);
  const map: Record<string, DbRole> = {
    ADMIN: DbRole.ADMIN,
    PROJECT_MANAGER: DbRole.PROJECT_MANAGER,
    FIELD_OPS: DbRole.FIELD_OPS,
    DEVELOPER: DbRole.DEVELOPER,
    CLIENT: DbRole.CLIENT,
  };
  return map[normalized] || (normalized as DbRole);
}

// User Status mapping
export function toApiUserStatus(dbValue: DbUserStatus | string): ApiUserStatus {
  const map: Record<string, ApiUserStatus> = {
    ACTIVE: ApiUserStatus.ACTIVE,
    INACTIVE: ApiUserStatus.INACTIVE,
    PENDING: ApiUserStatus.PENDING,
    DELETED: ApiUserStatus.DELETED,
  };
  return map[dbValue] || (dbValue as ApiUserStatus);
}

export function toDbUserStatus(apiValue: string): DbUserStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbUserStatus> = {
    ACTIVE: DbUserStatus.ACTIVE,
    INACTIVE: DbUserStatus.INACTIVE,
    PENDING: DbUserStatus.PENDING,
    DELETED: DbUserStatus.DELETED,
  };
  return map[normalized] || (normalized as DbUserStatus);
}

// Project Status mapping
export function toApiProjectStatus(dbValue: DbProjectStatus | string): ApiProjectStatus {
  const map: Record<string, ApiProjectStatus> = {
    ONGOING: ApiProjectStatus.ONGOING,
    COMPLETED: ApiProjectStatus.COMPLETED,
    PENDING_REVIEW: ApiProjectStatus.PENDING_REVIEW,
    APPROVED: ApiProjectStatus.APPROVED,
    REJECTED: ApiProjectStatus.REJECTED,
  };
  return map[dbValue] || (dbValue as ApiProjectStatus);
}

export function toDbProjectStatus(apiValue: string): DbProjectStatus {
  const normalized = normalizeString(apiValue)
    .replace(/\s+/g, '_')
    .toUpperCase();
  const map: Record<string, DbProjectStatus> = {
    ONGOING: DbProjectStatus.ONGOING,
    COMPLETED: DbProjectStatus.COMPLETED,
    PENDING_REVIEW: DbProjectStatus.PENDING_REVIEW,
    PENDINGREVIEW: DbProjectStatus.PENDING_REVIEW,
    APPROVED: DbProjectStatus.APPROVED,
    REJECTED: DbProjectStatus.REJECTED,
  };
  return map[normalized] || (normalized as DbProjectStatus);
}

// Developer Acceptance Status mapping
export function toApiDeveloperAcceptanceStatus(
  dbValue: DbDeveloperAcceptanceStatus | string,
): ApiDeveloperAcceptanceStatus {
  const map: Record<string, ApiDeveloperAcceptanceStatus> = {
    PENDING: ApiDeveloperAcceptanceStatus.PENDING,
    ACCEPTED: ApiDeveloperAcceptanceStatus.ACCEPTED,
    REJECTED: ApiDeveloperAcceptanceStatus.REJECTED,
  };
  return map[dbValue] || (dbValue as ApiDeveloperAcceptanceStatus);
}

export function toDbDeveloperAcceptanceStatus(apiValue: string): DbDeveloperAcceptanceStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbDeveloperAcceptanceStatus> = {
    PENDING: DbDeveloperAcceptanceStatus.PENDING,
    ACCEPTED: DbDeveloperAcceptanceStatus.ACCEPTED,
    REJECTED: DbDeveloperAcceptanceStatus.REJECTED,
  };
  return map[normalized] || (normalized as DbDeveloperAcceptanceStatus);
}

// Assignment Status mapping
export function toApiAssignmentStatus(dbValue: DbAssignmentStatus | string): ApiAssignmentStatus {
  const map: Record<string, ApiAssignmentStatus> = {
    COMPLETED: ApiAssignmentStatus.COMPLETED,
    ONGOING: ApiAssignmentStatus.ONGOING,
    PENDING: ApiAssignmentStatus.PENDING,
  };
  return map[dbValue] || (dbValue as ApiAssignmentStatus);
}

export function toDbAssignmentStatus(apiValue: string): DbAssignmentStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbAssignmentStatus> = {
    COMPLETED: DbAssignmentStatus.COMPLETED,
    ONGOING: DbAssignmentStatus.ONGOING,
    PENDING: DbAssignmentStatus.PENDING,
  };
  return map[normalized] || (normalized as DbAssignmentStatus);
}

// Report Status mapping
export function toApiReportStatus(dbValue: DbReportStatus | string): ApiReportStatus {
  const map: Record<string, ApiReportStatus> = {
    APPROVED: ApiReportStatus.APPROVED,
    PENDING: ApiReportStatus.PENDING,
    REJECTED: ApiReportStatus.REJECTED,
    CONFIRMED: ApiReportStatus.CONFIRMED,
    FLAGGED: ApiReportStatus.FLAGGED,
    UNDER_REVIEW: ApiReportStatus.UNDER_REVIEW,
  };
  return map[dbValue] || (dbValue as ApiReportStatus);
}

export function toDbReportStatus(apiValue: string): DbReportStatus {
  const normalized = normalizeString(apiValue)
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .toUpperCase()
    .replace(/-/g, '_');
  const map: Record<string, DbReportStatus> = {
    APPROVED: DbReportStatus.APPROVED,
    PENDING: DbReportStatus.PENDING,
    REJECTED: DbReportStatus.REJECTED,
    CONFIRMED: DbReportStatus.CONFIRMED,
    FLAGGED: DbReportStatus.FLAGGED,
    UNDER_REVIEW: DbReportStatus.UNDER_REVIEW,
    UNDERREVIEW: DbReportStatus.UNDER_REVIEW,
  };
  return map[normalized] || (normalized as DbReportStatus);
}

// Milestone Status mapping
export function toApiMilestoneStatus(dbValue: DbMilestoneStatus | string): ApiMilestoneStatus {
  const map: Record<string, ApiMilestoneStatus> = {
    COMPLETED: ApiMilestoneStatus.COMPLETED,
    ONGOING: ApiMilestoneStatus.ONGOING,
    PENDING: ApiMilestoneStatus.PENDING,
  };
  return map[dbValue] || (dbValue as ApiMilestoneStatus);
}

export function toDbMilestoneStatus(apiValue: string): DbMilestoneStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbMilestoneStatus> = {
    COMPLETED: DbMilestoneStatus.COMPLETED,
    ONGOING: DbMilestoneStatus.ONGOING,
    PENDING: DbMilestoneStatus.PENDING,
  };
  return map[normalized] || (normalized as DbMilestoneStatus);
}

// Milestone Name mapping
export function toApiMilestoneName(dbValue: DbMilestoneName | string): ApiMilestoneName {
  const map: Record<string, ApiMilestoneName> = {
    FOUNDATION: ApiMilestoneName.FOUNDATION,
    ROOFING: ApiMilestoneName.ROOFING,
    BUILDING: ApiMilestoneName.BUILDING,
    FINISHING: ApiMilestoneName.FINISHING,
    PLUMBING: ApiMilestoneName.PLUMBING,
    PAINTING: ApiMilestoneName.PAINTING,
  };
  return map[dbValue] || (dbValue as ApiMilestoneName);
}

export function toDbMilestoneName(apiValue: string): DbMilestoneName {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbMilestoneName> = {
    FOUNDATION: DbMilestoneName.FOUNDATION,
    ROOFING: DbMilestoneName.ROOFING,
    BUILDING: DbMilestoneName.BUILDING,
    FINISHING: DbMilestoneName.FINISHING,
    PLUMBING: DbMilestoneName.PLUMBING,
    PAINTING: DbMilestoneName.PAINTING,
  };
  return map[normalized] || (normalized as DbMilestoneName);
}

// Media Type mapping
export function toApiMediaType(dbValue: DbMediaType | string): ApiMediaType {
  const map: Record<string, ApiMediaType> = {
    IMAGE: ApiMediaType.IMAGE,
    VIDEO: ApiMediaType.VIDEO,
    DOCUMENT: ApiMediaType.DOCUMENT,
  };
  return map[dbValue] || (dbValue as ApiMediaType);
}

export function toDbMediaType(apiValue: string): DbMediaType {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbMediaType> = {
    IMAGE: DbMediaType.IMAGE,
    VIDEO: DbMediaType.VIDEO,
    DOCUMENT: DbMediaType.DOCUMENT,
  };
  return map[normalized] || (normalized as DbMediaType);
}

// Notification Type mapping
export function toApiNotificationType(
  dbValue: DbNotificationType | string,
): ApiNotificationType {
  const map: Record<string, ApiNotificationType> = {
    USER: ApiNotificationType.USER,
    PAYMENT: ApiNotificationType.PAYMENT,
    ORDER: ApiNotificationType.ORDER,
    MILESTONE: ApiNotificationType.MILESTONE,
    MESSAGE: ApiNotificationType.MESSAGE,
    REPORT: ApiNotificationType.REPORT,
    ASSIGNMENT: ApiNotificationType.ASSIGNMENT,
  };
  return map[dbValue] || (dbValue as ApiNotificationType);
}

export function toDbNotificationType(apiValue: string): DbNotificationType {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbNotificationType> = {
    USER: DbNotificationType.USER,
    PAYMENT: DbNotificationType.PAYMENT,
    ORDER: DbNotificationType.ORDER,
    MILESTONE: DbNotificationType.MILESTONE,
    MESSAGE: DbNotificationType.MESSAGE,
    REPORT: DbNotificationType.REPORT,
    ASSIGNMENT: DbNotificationType.ASSIGNMENT,
  };
  return map[normalized] || (normalized as DbNotificationType);
}

// Transaction Status mapping
export function toApiTransactionStatus(
  dbValue: DbTransactionStatus | string,
): ApiTransactionStatus {
  const map: Record<string, ApiTransactionStatus> = {
    PENDING: ApiTransactionStatus.PENDING,
    COMPLETED: ApiTransactionStatus.COMPLETED,
    FAILED: ApiTransactionStatus.FAILED,
  };
  return map[dbValue] || (dbValue as ApiTransactionStatus);
}

export function toDbTransactionStatus(apiValue: string): DbTransactionStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbTransactionStatus> = {
    PENDING: DbTransactionStatus.PENDING,
    COMPLETED: DbTransactionStatus.COMPLETED,
    FAILED: DbTransactionStatus.FAILED,
  };
  return map[normalized] || (normalized as DbTransactionStatus);
}

// Transaction Type mapping
export function toApiTransactionType(dbValue: DbTransactionType | string): ApiTransactionType {
  const map: Record<string, ApiTransactionType> = {
    DEPOSIT: ApiTransactionType.DEPOSIT,
    RELEASE: ApiTransactionType.RELEASE,
    SUBSCRIPTION: ApiTransactionType.SUBSCRIPTION,
    WITHDRAWAL: ApiTransactionType.WITHDRAWAL,
    TRANSFER: ApiTransactionType.TRANSFER,
  };
  return map[dbValue] || (dbValue as ApiTransactionType);
}

export function toDbTransactionType(apiValue: string): DbTransactionType {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbTransactionType> = {
    DEPOSIT: DbTransactionType.DEPOSIT,
    RELEASE: DbTransactionType.RELEASE,
    SUBSCRIPTION: DbTransactionType.SUBSCRIPTION,
    WITHDRAWAL: DbTransactionType.WITHDRAWAL,
    TRANSFER: DbTransactionType.TRANSFER,
  };
  return map[normalized] || (normalized as DbTransactionType);
}

// Escrow Status mapping
export function toApiEscrowStatus(dbValue: DbEscrowStatus | string): ApiEscrowStatus {
  const map: Record<string, ApiEscrowStatus> = {
    APPROVED: ApiEscrowStatus.APPROVED,
    PENDING: ApiEscrowStatus.PENDING,
    REJECTED: ApiEscrowStatus.REJECTED,
  };
  return map[dbValue] || (dbValue as ApiEscrowStatus);
}

export function toDbEscrowStatus(apiValue: string): DbEscrowStatus {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbEscrowStatus> = {
    APPROVED: DbEscrowStatus.APPROVED,
    PENDING: DbEscrowStatus.PENDING,
    REJECTED: DbEscrowStatus.REJECTED,
  };
  return map[normalized] || (normalized as DbEscrowStatus);
}

// Construction Type mapping
export function toApiConstructionType(
  dbValue: DbConstructionType | string,
): ApiConstructionType {
  const map: Record<string, ApiConstructionType> = {
    DUPLEX: ApiConstructionType.DUPLEX,
    APARTMENT: ApiConstructionType.APARTMENT,
    COMMERCIAL: ApiConstructionType.COMMERCIAL,
    RENOVATION: ApiConstructionType.RENOVATION,
  };
  return map[dbValue] || (dbValue as ApiConstructionType);
}

export function toDbConstructionType(apiValue: string): DbConstructionType {
  const normalized = normalizeString(apiValue).toUpperCase();
  const map: Record<string, DbConstructionType> = {
    DUPLEX: DbConstructionType.DUPLEX,
    APARTMENT: DbConstructionType.APARTMENT,
    COMMERCIAL: DbConstructionType.COMMERCIAL,
    RENOVATION: DbConstructionType.RENOVATION,
  };
  return map[normalized] || (normalized as DbConstructionType);
}

