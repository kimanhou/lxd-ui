import { type FC } from "react";
import { Spinner, Icon } from "@canonical/react-components";
import { useReplicatorState } from "context/useReplicators";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorStatus: FC<Props> = ({ replicator }) => {
  const {
    data: state,
    error,
    isLoading,
  } = useReplicatorState(replicator.name, replicator.project);

  if (isLoading) {
    return <Spinner className="u-no-margin" />;
  }

  if (error) {
    return (
      <>
        <Icon name="status-failed-small" className="status-icon" />
        Unknown
      </>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-succeeded-small";
      case "Running":
        return "status-in-progress-small";
      case "Failed":
        return "status-failed-small";
      case "Pending":
        return "status-queued-small";
      default:
        return "status-waiting-small";
    }
  };

  // Handle case where API returns object with status property or direct string
  const statusValue =
    typeof state === "object" && state !== null && "status" in state
      ? (state as any).status
      : state;

  return (
    <>
      <Icon name={getStatusIcon(statusValue || "")} className="status-icon" />
      {statusValue || "Unknown"}
    </>
  );
};

export { ReplicatorStatus };
