import type { FC } from "react";
import { Card } from "@canonical/react-components";

const NetworksCard: FC = () => {
  return (
    <Card className="overview-card networks" title="Networks">
      <p>Topology map, including load balancers</p>
    </Card>
  );
};

export default NetworksCard;
