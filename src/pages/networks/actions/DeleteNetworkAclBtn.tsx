import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdNetworkAcl } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { deleteNetworkAcl } from "api/network-acls";
import { ROOT_PATH } from "util/rootPath";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const DeleteNetworkAclBtn: FC<Props> = ({ networkAcl, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canDeleteNetworkAcl } = useNetworkAclEntitlements();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const notifySuccess = () => {
    toastNotify.success(
      <>
        Network ACL{" "}
        <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
        deleted.
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkAcl(networkAcl.name, project)
      .then((operation) => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networkAcls,
        });
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acls`,
        );
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of Network ACL{" "}
              <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
              has started.
            </>,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              notifySuccess();
            },
            (msg) =>
              toastNotify.failure(
                `Deletion of network ACL ${networkAcl.name} failed`,
                new Error(msg),
              ),
          );
        } else {
          notifySuccess();
        }
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Deletion of network ACL failed", e);
      });
  };

  const isUsed = (networkAcl.used_by?.length ?? 0) > 0;

  const getOnHoverText = () => {
    if (!canDeleteNetworkAcl(networkAcl)) {
      return "You do not have permission to delete this ACL";
    }

    if (isUsed) {
      return "Can not delete, ACL is currently in use";
    }

    return "";
  };

  return (
    <ConfirmationButton
      onHoverText={getOnHoverText()}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the ACL{" "}
            <ResourceLabel type="network-acl" value={networkAcl.name} bold />?
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={!canDeleteNetworkAcl(networkAcl) || isUsed || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>Delete ACL</span>
    </ConfirmationButton>
  );
};

export default DeleteNetworkAclBtn;
