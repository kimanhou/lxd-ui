import type { FC } from "react";
import { Card, DoughnutChart, Icon } from "@canonical/react-components";

const InstancesDashboardContainer: FC = () => {
  return (
    <Card
      className="dashboard-card instances"
      title={
        <>
          <Icon name="pods" /> Instances (10)
        </>
      }
    >
      <div className="group-by-status-container">
        <div className="group-by-status running">
          <p className="status-label u-text--muted">Running</p>
          <strong className="status-count">6</strong>
        </div>

        <div className="group-by-status stopped">
          <p className="status-label u-text--muted">Stopped</p>
          <strong className="status-count">1</strong>
        </div>

        <div className="group-by-status pending">
          <p className="status-label u-text--muted">Pending</p>
          <strong className="status-count">2</strong>
        </div>

        <div className="group-by-status error">
          <p className="status-label u-text--muted">Error</p>
          <strong className="status-count">1</strong>
        </div>
      </div>

      <div className="group-by-type-container">
        <DoughnutChart
          segments={[
            {
              color: "#0e8420",
              tooltip: "6 VMs",
              value: 6,
            },
            {
              color: "#24598f",
              tooltip: "4 containers",
              value: 4,
            },
          ]}
          size={150}
          segmentHoverWidth={45}
          segmentThickness={40}
          chartID="default"
          className="group-by-type-doughnut-chart"
        />
        <span>
          <div className="dot" style={{ backgroundColor: "#0e8420" }}></div>6
          VMs &nbsp;| &nbsp;
          <div className="dot" style={{ backgroundColor: "#24598f" }}></div>4
          containers
        </span>
      </div>
    </Card>
  );
};

export default InstancesDashboardContainer;
