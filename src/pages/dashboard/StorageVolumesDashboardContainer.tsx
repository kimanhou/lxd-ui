import type { FC } from "react";
import { Card } from "@canonical/react-components";

const StorageVolumesDashboardContainer: FC = () => {
  return (
    <Card className="overview-card storage-volumes" title="Storage Volumes">
      <p>No. of Storage Volumes</p>
    </Card>
  );
};

export default StorageVolumesDashboardContainer;
