import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import ResourceLabel from "components/ResourceLabel";
import { queryKeys } from "util/queryKeys";
import { ROOT_PATH } from "util/rootPath";
import type { LxdReplicator } from "types/replicator";
import { deleteReplicator } from "api/replicators";

interface Props {
  replicator: LxdReplicator;
}

const DeleteReplicatorBtn: FC<Props> = ({ replicator }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const notifySuccess = (replicatorName: string) => {
    toastNotify.success(
      <>
        Replicator{" "}
        <ResourceLabel bold type="replicator" value={replicatorName} /> deleted.
      </>,
    );
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.replicators],
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the replicators list if we are still on the deleted replicator's detail page
    const replicatorDetailPath = `${ROOT_PATH}/ui/replicator/${encodeURIComponent(replicator.name)}`;
    if (location.pathname.startsWith(replicatorDetailPath)) {
      navigate(`${ROOT_PATH}/ui/replicators`);
    }

    notifySuccess(replicator.name);
    setLoading(false);
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deleting replicator ${replicator.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteReplicator(replicator.name).then(onSuccess).catch(onFailure);
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete replicator{" "}
            <ResourceLabel type="replicator" value={replicator.name} bold />.
          </p>
        ),
        confirmButtonLabel: "Delete replicator",
        onConfirm: handleDelete,
        message: "Delete replicator",
      }}
      appearance="base"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={isLoading}
      aria-label="Delete"
      title="Delete replicator"
      className="has-icon"
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export { DeleteReplicatorBtn };
