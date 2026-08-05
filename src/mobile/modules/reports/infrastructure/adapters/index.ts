import type { ReportCommands } from '../../application/ports/report-commands.port';
import type { ReportQueries } from '../../application/ports/report-queries.port';
import { ReportCommandAdapter } from './input/report-command.adapter';
import { ReportQueryAdapter } from './input/report-query.adapter';

export type ReportDb = ReportCommands & ReportQueries;

let cached: ReportDb | null = null;

export function getReportDb(): ReportDb {
  if (!cached) {
    const command = ReportCommandAdapter.create();
    const query = ReportQueryAdapter.create();
    cached = {
      submit: (input, options) => command.submit(input, options),
      getMyReports: (userId) => query.getMyReports(userId),
      getAllReports: () => query.getAllReports(),
      getReportById: (reportId) => query.getReportById(reportId),
      subscribe: (callback) => query.subscribe(callback),
      subscribeMyReports: (userId, callback) => query.subscribeMyReports(userId, callback),
    };
  }
  return cached;
}
