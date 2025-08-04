export interface PGError extends Error {
  driverError: {
    code: string;
  };
}
