export abstract class ReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportError';
  }
}

export class InvalidReportError extends ReportError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReportError';
  }
}

export class ReportNotFoundError extends ReportError {
  constructor(reportId: string) {
    super(`Reporte no encontrado: ${reportId}`);
    this.name = 'ReportNotFoundError';
  }
}

export class UnauthorizedReportError extends ReportError {
  constructor(message = 'No tienes permisos para esta operación sobre el reporte.') {
    super(message);
    this.name = 'UnauthorizedReportError';
  }
}

export class ReportAuthenticationRequiredError extends ReportError {
  constructor(message = 'Debes iniciar sesión para enviar el reporte.') {
    super(message);
    this.name = 'ReportAuthenticationRequiredError';
  }
}
