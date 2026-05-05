import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "./auth";
import { useCurrentProject } from "./useCurrentProject";
import { ALL_PROJECTS } from "util/projects";
import {
  fetchReplicators,
  fetchReplicator,
  fetchReplicatorState,
} from "api/replicators";

export const useReplicators = (isEnabled = true) => {
  const { isFineGrained } = useAuth();
  const { project } = useCurrentProject();

  return useQuery({
    queryKey: [queryKeys.replicators, project?.name],
    queryFn: async () => {
      if (project?.name === ALL_PROJECTS) {
        return fetchReplicators(undefined, true, isFineGrained);
      }
      return fetchReplicators(project?.name, false, isFineGrained);
    },
    enabled: isEnabled && isFineGrained !== null && project !== undefined,
  });
};

export const useReplicator = (
  name: string,
  project: string,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.replicators, project, name],
    queryFn: async () => fetchReplicator(name, project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};

export const useReplicatorState = (
  name: string,
  project: string,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.replicators, project, name, "state"],
    queryFn: async () => fetchReplicatorState(name, project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time status updates
  });
};
