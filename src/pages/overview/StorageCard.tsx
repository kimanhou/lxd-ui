import type { FC } from "react";
import { Card } from "@canonical/react-components";

const StorageCard: FC = () => {
  return (
    <Card className="overview-card storage" title="Storage">
      <p>No. of Storage Pools</p>
      <p>Top 3 most full pools (sorted by usage %)</p>
      <p>No. of Storage Volumes</p>
    </Card>
  );
};

export default StorageCard;
