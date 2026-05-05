export interface LxdReplicator {
  name: string;
  description?: string;
  project: string;
  config: {
    cluster: string; // target cluster link
    snapshot?: boolean;
    schedule?: string; // cron expression
  };
  lastRunAt?: string; // DateTime
}

export type LxdReplicatorState = "Pending" | "Running" | "Completed" | "Failed";
