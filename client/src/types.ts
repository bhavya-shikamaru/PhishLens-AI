export type Risk = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export interface Assessment {
  risk: Risk;
  payloadType: string;
  evidence: string[];
  uncertainty: string;
  recommendedAction: string[];
  deterministicObservations: string[];
  disclaimer: string;
}
