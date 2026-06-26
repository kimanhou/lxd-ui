import type { FC } from "react";
import { Card } from "@canonical/react-components";

const StoragePoolsCard: FC = () => {
  return (
    <Card className="overview-card storage-pools" title="Storage Pools">
      <p>No. of Storage Pools</p>
      <p>Top 3 most full pools (sorted by usage %)</p>
    </Card>
  );
};

export default StoragePoolsCard;
