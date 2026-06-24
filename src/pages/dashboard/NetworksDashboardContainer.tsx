import type { FC } from "react";
import { Card } from "@canonical/react-components";

const NetworksDashboardContainer: FC = () => {
  return (
    <Card className="overview-card networks" title="Networks">
      <p>Topology map, including load balancers</p>
    </Card>
  );
};

export default NetworksDashboardContainer;
