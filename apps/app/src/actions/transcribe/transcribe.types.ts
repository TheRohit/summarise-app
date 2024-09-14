import { SequenceFlowOutput } from "../../../../../packages/jobs/trigger/sequence";

export interface ProcessResponse {
  output: SequenceFlowOutput;
  status:
    | "COMPLETED"
    | "CANCELED"
    | "QUEUED"
    | "EXECUTING"
    | "WAITING_FOR_DEPLOY"
    | "REATTEMPTING"
    | "FROZEN"
    | "FAILED"
    | "CRASHED"
    | "INTERRUPTED"
    | "SYSTEM_FAILURE"
    | "DELAYED"
    | "EXPIRED";
}
