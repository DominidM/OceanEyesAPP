import type { CreateReportCommand } from '../dto/create-report.dto';
import type { CreateReportResultDto } from '../dto/report.dto';

export interface ReportCommands {
  submit(command: CreateReportCommand, options: { online: boolean }): Promise<CreateReportResultDto>;
}
