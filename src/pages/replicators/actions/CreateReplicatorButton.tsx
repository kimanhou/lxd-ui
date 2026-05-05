import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";

export const CreateReplicatorButton: FC = () => {
  // For now, we'll create a basic button without entitlements
  // Will be enhanced later with proper permissions and panel integration

  return (
    <Button
      name="Create replicator"
      hasIcon
      appearance="positive"
      className="u-float-right u-no-margin--bottom"
      onClick={() => {
        // Will be implemented with panel or navigation
        console.log("Create replicator clicked");
      }}
    >
      <Icon name="plus" light className="u-margin--right" />
      <span>Create replicator</span>
    </Button>
  );
};
