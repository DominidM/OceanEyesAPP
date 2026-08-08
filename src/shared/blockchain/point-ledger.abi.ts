export const POINT_LEDGER_ABI = [
  'function awardPoints(address reporter, string calldata reportId, string calldata category)',
  'function getBalance(address user) view returns (uint256)',
  'function pointsForCategory(string category) view returns (uint256)',
  'function isReportProcessed(string reportId) view returns (bool)',
  'function revokePoints(string reportId)',
] as const;
