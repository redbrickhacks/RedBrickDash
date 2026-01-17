import { HibiscusRole } from './roles';
import { ApplicationStatus } from './application-status';

export interface HibiscusUser {
  id: string;
  firstName: string;
  lastName: string;
  role: HibiscusRole;
  tag: string;
  email: string;
  applicationId?: string;
  applicationStatus: ApplicationStatus;
  applicationStatusLastChanged?: Date;
  teamId?: string;
  attendanceConfirmed?: boolean;
  submissionStatus?: number;
  submittedAt?: Date;
  createdAt?: Date;
  points?: number;
  referralCode?: string;
  referralCount?: number;
}
