import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  CustomSelect,
  Notification,
  Col,
  Row,
} from "@canonical/react-components";
import ScrollableForm from "components/ScrollableForm";
import type {
  ProjectFormValues,
  ProjectReplicaFormValues,
} from "types/forms/project";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import { useClusterLinks } from "context/useClusterLinks";
import { useNotify } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import { useIdentities } from "context/useIdentities";
import { ensureEditMode } from "util/editMode";

export const replicaPayload = (
  values: ProjectReplicaFormValues,
): LxdConfigPair => {
  const replicaMode = values.replica_mode || "";
  const replicaCluster = values.replica_cluster || "";

  return {
    [getProjectKey("replica_mode")]: replicaMode,
    [getProjectKey("replica_cluster")]:
      replicaMode === "" ? "" : replicaCluster,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ProjectReplicaForm: FC<Props> = ({ formik }) => {
  const { data: links = [], error } = useClusterLinks();
  const { data: identities = [] } = useIdentities();
  const notify = useNotify();
  const [showLeaderWarning, setShowLeaderWarning] = useState(false);
  const [previousMode, setPreviousMode] = useState(formik.values.replica_mode);

  if (error) {
    notify.failure("Loading cluster links failed", error);
  }

  const currentMode = formik.values.replica_mode;
  const currentCluster = formik.values.replica_cluster;

  // Get active cluster links
  const activeLinks = links.filter((link) => {
    const identity = identities.find(
      (identity) =>
        identity.name === link.name &&
        identity.type.startsWith("Cluster link certificate"),
    );
    return !identity?.type.toLowerCase().includes("(pending)");
  });

  const hasNoActiveLinks = activeLinks.length === 0;

  // Handle mode changes and show warning when switching from standby to leader
  useEffect(() => {
    if (previousMode === "standby" && currentMode === "leader") {
      setShowLeaderWarning(true);
    } else {
      setShowLeaderWarning(false);
    }
    setPreviousMode(currentMode);
  }, [currentMode, previousMode]);

  // Clear and disable cluster field when mode is "none"
  useEffect(() => {
    if (currentMode === "" && currentCluster) {
      formik.setFieldValue("replica_cluster", "");
    }
  }, [currentMode, currentCluster, formik]);

  const modeOptions = [
    { value: "", label: "None" },
    { value: "leader", label: "Leader" },
    { value: "standby", label: "Standby" },
  ];

  const clusterOptions = hasNoActiveLinks
    ? [{ value: "", label: "No active cluster links available" }]
    : [
        { value: "", label: "Select a cluster" },
        ...activeLinks.map((link) => ({
          value: link.name,
          label: link.name,
        })),
      ];

  const helpText = hasNoActiveLinks ? (
    <>
      Active cluster links are required for replication. Create your first{" "}
      <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster link</Link>.
    </>
  ) : (
    <>
      Cluster to replicate with. Manage your{" "}
      <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster links</Link>.
    </>
  );

  const isClusterDisabled = currentMode === "" || hasNoActiveLinks;

  return (
    <ScrollableForm>
      {showLeaderWarning && currentCluster && (
        <Row>
          <Col size={12}>
            <Notification
              severity="caution"
              title="Promoting to Leader"
              className="u-no-margin--bottom"
            >
              Promoting this project to &quot;Leader&quot; will allow instance
              management. Ensure the project on target cluster &quot;
              {currentCluster}&quot; is in &quot;Standby&quot; or is unreachable
              to prevent synchronization conflicts.
            </Notification>
          </Col>
        </Row>
      )}

      <Row>
        <Col size={12}>
          <CustomSelect
            name="replica_mode"
            label="Replica mode"
            options={modeOptions}
            value={currentMode || ""}
            onChange={(value) => {
              ensureEditMode(formik);
              formik.setFieldValue("replica_mode", value);
            }}
            help="Set replication mode for this project"
            error={
              formik.touched.replica_mode ? formik.errors.replica_mode : null
            }
          />
        </Col>
      </Row>

      <Row>
        <Col size={12}>
          <CustomSelect
            name="replica_cluster"
            label="Replica cluster"
            options={clusterOptions}
            value={currentCluster || ""}
            disabled={isClusterDisabled}
            onChange={(value) => {
              ensureEditMode(formik);
              formik.setFieldValue("replica_cluster", value);
            }}
            help={helpText}
            error={
              formik.touched.replica_cluster
                ? formik.errors.replica_cluster
                : null
            }
          />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProjectReplicaForm;
