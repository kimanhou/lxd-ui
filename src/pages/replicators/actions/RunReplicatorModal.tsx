import { type FC, useState } from "react";
import {
  ActionButton,
  Button,
  CheckboxInput,
  Modal,
  Notification,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdReplicator } from "types/replicator";
import { runReplicator } from "api/replicators";
import { queryKeys } from "util/queryKeys";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";
import ProjectRichChip from "pages/projects/ProjectRichChip";

interface Props {
  replicator: LxdReplicator;
  close: () => void;
}

// Hook to get project replica mode - can be updated when API provides this info
const useProjectReplicaMode = (project: string) => {
  // TODO: Replace with actual API call when available
  // For now, return "leader" as default (restore disabled)
  console.log("TODO: fetch replica mode for project", project);
  return "standby"; // or "leader"
};

const RunReplicatorModal: FC<Props> = ({ replicator, close }) => {
  const [isRestore, setIsRestore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const projectReplicaMode = useProjectReplicaMode(replicator.project);
  const isStandbyMode = projectReplicaMode === "standby";

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.replicators],
    });
  };

  const onSuccess = () => {
    invalidateCache();
    setIsLoading(false);
    toastNotify.success(
      <>
        Replicator{" "}
        <ResourceLabel bold type="replicator" value={replicator.name} />{" "}
        {isRestore ? "restore" : "run"} started.
      </>,
    );
    close();
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setIsLoading(false);
    notify.failure(
      `${isRestore ? "Restoring" : "Running"} replicator ${replicator.name} failed`,
      e,
    );
  };

  const handleRun = () => {
    setIsLoading(true);
    runReplicator(replicator.name, replicator.project, isRestore)
      .then(onSuccess)
      .catch(onFailure);
  };

  const getDirectionIcon = () => {
    return isRestore ? <>&larr;</> : <>&rarr;</>;
  };

  return (
    <Modal
      close={close}
      title={`Run replicator ${replicator.name}`}
      className="run-replicator-modal"
      buttonRow={[
        <span className="u-float-left confirm-input" key="restore-checkbox">
          <CheckboxInput
            label="Restore"
            checked={isRestore}
            onChange={(event) => {
              setIsRestore((event.target as HTMLInputElement).checked);
            }}
            disabled={!isStandbyMode}
          />
        </span>,
        <Button
          key="cancel-button"
          appearance="base"
          className="u-no-margin--bottom"
          onClick={close}
          type="button"
        >
          Cancel
        </Button>,
        <ActionButton
          key="run-button"
          appearance="positive"
          className="u-no-margin--bottom"
          loading={isLoading}
          disabled={isLoading}
          onClick={handleRun}
        >
          Run
        </ActionButton>,
      ]}
    >
      <div className="u-flex u-gap--small" style={{ marginBottom: "1rem" }}>
        <span
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            textAlign: "center",
            flex: 1,
          }}
        >
          Local project
          <br /> <ProjectRichChip projectName={replicator.project} />
        </span>{" "}
        <span style={{ fontSize: "2em" }}>{getDirectionIcon()}</span>{" "}
        <span
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            textAlign: "center",
            flex: 1,
          }}
        >
          Target cluster link
          <br />{" "}
          <ResourceLink
            type="cluster-link"
            value={replicator.config.cluster}
            to={""}
          />
        </span>
      </div>

      <p>
        {isRestore
          ? `This will pull instances from the ${replicator.config.cluster} cluster and overwrite the local instances in the ${replicator.project} project. This is typically used to recover data after a failover.`
          : `This will synchronize all instances from the ${replicator.project} project to the ${replicator.config.cluster} cluster.`}
      </p>

      {!isStandbyMode && (
        <p className="u-text--muted">
          <strong>Note:</strong> Restore is only available when project mode is
          standby.
        </p>
      )}

      {/* Warning for restore mode */}
      {isRestore && (
        <Notification severity="caution" title="Warning" titleElement="h4">
          This operation will sync instances from the remote cluster to this
          project. Ensure all local instances are stopped before proceeding.
        </Notification>
      )}
    </Modal>
  );
};

export { RunReplicatorModal };
