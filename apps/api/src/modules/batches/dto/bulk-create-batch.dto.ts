import { BatchStatus } from '@prisma/client';

export class BulkCreateBatchDto {
  name: string;
  startYear: number;
  endYear: number;
  status?: BatchStatus;
  programs: {
    programId: string;
    schemeId: string;
    differentiators: string[];
  }[];
}
