import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import type { LxdReplicator } from "types/replicator";
import { RunReplicatorModal } from "./RunReplicatorModal";

interface Props {
  replicator: LxdReplicator;
}

const RunReplicatorBtn: FC<Props> = ({ replicator }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      <Button
        appearance="base"
        hasIcon
        dense={true}
        onClick={openPortal}
        type="button"
        aria-label="Run"
        title="Run replicator"
      >
        <Icon name="play" />
      </Button>

      {isOpen && (
        <Portal>
          <RunReplicatorModal replicator={replicator} close={closePortal} />
        </Portal>
      )}
    </>
  );
};

export { RunReplicatorBtn };
