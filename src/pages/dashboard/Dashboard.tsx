import type { FC } from "react";
import { CustomLayout, Row } from "@canonical/react-components";
import PageHeader from "components/PageHeader";
import ClusterDashboardContainer from "pages/dashboard/ClusterDashboardContainer";
import InstancesDashboardContainer from "pages/dashboard/InstancesDashboardContainer";
import ProjectsDashboardContainer from "pages/dashboard/ProjectsDashboardContainer";
import StoragePoolsDashboardContainer from "pages/dashboard/StoragePoolsDashboardContainer";
import StorageVolumesDashboardContainer from "pages/dashboard/StorageVolumesDashboardContainer";
import NetworksDashboardContainer from "pages/dashboard/NetworksDashboardContainer";

const Dashboard: FC = () => {
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
        <ClusterDashboardContainer />
        <InstancesDashboardContainer />
      </Row>
      <Row>
        <ProjectsDashboardContainer />
      </Row>
      <Row className="overview-row">
        <StoragePoolsDashboardContainer />
        <StorageVolumesDashboardContainer />
      </Row>
      <Row>
        <NetworksDashboardContainer />
      </Row>
    </CustomLayout>
  );
};

export default Dashboard;
