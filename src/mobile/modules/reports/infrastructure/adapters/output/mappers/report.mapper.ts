import type { Timestamp } from 'firebase/firestore';

import type { Report as FirestoreReport, ReportInput } from '@/shared/firebase/types';

import type { NewReport, Report } from '@/modules/reports/domain/entities/report';

function toDate(value: Timestamp | Date | undefined): Date {
  if (value instanceof Date) return value;
  if (value && typeof value.toDate === 'function') return value.toDate();
  return new Date();
}

export function toDomainReport(raw: FirestoreReport): Report {
  return {
    id: raw.id,
    userId: raw.userId,
    category: raw.category,
    title: raw.title,
    description: raw.description ?? null,
    isAnonymous: raw.isAnonymous,
    deviceHash: raw.deviceHash ?? null,
    location: raw.location ?? null,
    photoURLs: raw.photoURLs ?? [],
    audioURL: raw.audioURL ?? null,
    audioDurationMillis: raw.audioDurationMillis ?? null,
    status: raw.status,
    pointsAwarded: raw.pointsAwarded ?? 0,
    txHash: raw.txHash ?? null,
    createdAt: toDate(raw.createdAt),
    submittedAt: toDate(raw.submittedAt),
    reviewedAt: raw.reviewedAt ? toDate(raw.reviewedAt) : null,
    reviewedBy: raw.reviewedBy ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    customIcon: raw.customIcon ?? null,
  };
}

export function newReportToInput(newReport: NewReport): ReportInput {
  return {
    category: newReport.category,
    title: newReport.title,
    description: newReport.description ?? undefined,
    isAnonymous: newReport.isAnonymous,
    deviceHash: newReport.deviceHash ?? undefined,
    location: newReport.location ?? undefined,
    customIcon: newReport.customIcon ?? undefined,
  };
}
