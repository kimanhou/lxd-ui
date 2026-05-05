import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { ROOT_PATH } from "util/rootPath";
import { Link } from "react-router-dom";
import type { LxdReplicator } from "types/replicator";

interface Props {
  replicator: LxdReplicator;
}

const EditReplicatorBtn: FC<Props> = ({ replicator }) => {
  return (
    <Button
      element={Link}
      to={`${ROOT_PATH}/ui/replicator/${encodeURIComponent(replicator.name)}/edit`}
      appearance="base"
      hasIcon
      dense={true}
      type="button"
      aria-label="Edit"
      title="Edit replicator"
    >
      <Icon name="edit" />
    </Button>
  );
};

export { EditReplicatorBtn };
