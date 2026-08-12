import { createNewReport } from '../../domain/entities/report';
import type { ReportIdentityPort } from '../../domain/ports/report-identity';
import type { ReportRepository } from '../../domain/ports/report-repository';
import type { CreateReportCommand } from '../dto/create-report.dto';
import type { CreateReportResultDto } from '../dto/report.dto';
import type { ReportCommands } from '../ports/report-commands.port';

export class ReportCommandService implements ReportCommands {
  constructor(
    private readonly identity: ReportIdentityPort,
    private readonly repository: ReportRepository,
  ) {}

  async submit(command: CreateReportCommand, options: { online: boolean }): Promise<CreateReportResultDto> {
    const newReport = createNewReport(command);
    const deviceHash = await this.identity.getDeviceHash();
    const reportWithDevice = deviceHash ? { ...newReport, deviceHash } : newReport;
    const signedIn = await this.identity.ensureSignedIn();
    const result = await this.repository.insert(reportWithDevice, command.media ?? [], {
      online: signedIn && options.online,
    }, command.audio ?? null);
    return {
      reportId: result.reportId,
      queued: result.queued,
      mediaWarning: result.mediaWarning ?? null,
    };
  }
}
