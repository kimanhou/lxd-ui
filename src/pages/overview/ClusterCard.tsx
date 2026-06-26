import type { FC } from "react";
import { Card } from "@canonical/react-components";

const ClusterCard: FC = () => {
  return (
    <Card className="overview-card cluster" title="Cluster">
      <p>Memory usage</p>
      <p>Member disk usage</p>
      <p>Top 3 highest Memory or CPU members</p>
      <p>Aggregate member statuses</p>
    </Card>
  );
};

export default ClusterCard;
