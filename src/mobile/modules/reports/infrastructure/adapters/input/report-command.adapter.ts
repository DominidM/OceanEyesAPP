import type { CreateReportCommand } from '../../../application/dto/create-report.dto';
import type { CreateReportResultDto } from '../../../application/dto/report.dto';
import type { ReportCommands } from '../../../application/ports/report-commands.port';
import { ReportCommandService } from '../../../application/services/report-command.service';
import { FirestoreReportRepository } from '../output/firestore-report.repository';
import { OutboxReportRepository } from '../output/outbox-report.repository';
import { ReportIdentityAdapter } from '../output/report-identity.adapter';
import { ReportMediaAdapter } from '../output/report-media.adapter';

export class ReportCommandAdapter {
  constructor(private readonly commands: ReportCommands) {}

  static create(): ReportCommandAdapter {
    const identity = new ReportIdentityAdapter();
    const media = new ReportMediaAdapter();
    const outbox = new OutboxReportRepository();
    const repository = new FirestoreReportRepository(media, outbox);
    return new ReportCommandAdapter(new ReportCommandService(identity, repository));
  }

  submit(command: CreateReportCommand, options: { online: boolean }): Promise<CreateReportResultDto> {
    return this.commands.submit(command, options);
  }
}
