import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import PageHeader from "components/PageHeader";
import ClusterCard from "pages/overview/ClusterCard";
import InstancesCard from "pages/overview/InstancesCard";
import ProjectsCard from "pages/overview/ProjectsCard";
import StoragePoolsCard from "pages/overview/StoragePoolsCard";
import StorageVolumesCard from "pages/overview/StorageVolumesCard";
import NetworksCard from "pages/overview/NetworksCard";

const Overview: FC = () => {
  return (
    <CustomLayout
      mainClassName="overview"
      contentClassName="overview-content"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>Overview</PageHeader.Title>
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <Row className="overview-row">
        <ClusterCard />
        <InstancesCard />
      </Row>
      <Row>
        <ProjectsCard />
      </Row>
      <Row className="overview-row">
        <StoragePoolsCard />
        <StorageVolumesCard />
      </Row>
      <Row>
        <NetworksCard />
      </Row>
    </CustomLayout>
  );
};

export default Overview;
