import type { FC } from "react";
import { Card } from "@canonical/react-components";

const ProjectsDashboardContainer: FC = () => {
  return (
    <Card className="overview-card projects" title="Projects">
      <p>No. of Projects</p>
    </Card>
  );
};

export default ProjectsDashboardContainer;
