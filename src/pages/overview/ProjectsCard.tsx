import type { FC } from "react";
import { Card } from "@canonical/react-components";

const ProjectsCard: FC = () => {
  return (
    <Card className="overview-card projects" title="Projects">
      <p>No. of Projects</p>
    </Card>
  );
};

export default ProjectsCard;
