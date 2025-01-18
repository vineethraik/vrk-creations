export const STATUS = {
  SUCCESS: "success",
  OK: "ok",
  NOT_FOUND: "not_found",
  FAILED: "failed",
  ERROR: "error",
  WARNING: "warning",
  UNAUTHORIZED: "unauthorized",
  UNINITIALIZED: "uninitialized",
  INVALID: "invalid",
};

export class Response {
  constructor({ status, message, data }) {
    this.message = message;
    this.status = status;
    this.data = data;
  }
}
