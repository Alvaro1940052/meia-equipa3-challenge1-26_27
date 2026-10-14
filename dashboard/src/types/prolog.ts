export interface LoadBaseResponse {
  status: string;
  message: string;
  initial_facts_count: number;
}

export interface ExplainResponse {
  status: string;
  fact_id?: number;
  fact?: string;
  explanation: string[];
}

export interface ResetResponse {
  status: string;
  message: string;
}
