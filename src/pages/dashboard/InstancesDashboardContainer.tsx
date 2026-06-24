import { useMemo, type FC } from "react";
import {
  Card,
  DoughnutChart,
  Icon,
  isDarkTheme,
  Link,
  loadTheme,
  Spinner,
} from "@canonical/react-components";
import { useAuth } from "context/auth";
import { useInstances } from "context/useInstances";
import InstanceEmptyState from "pages/instances/InstanceEmptyState";
import type { LxdInstance, LxdInstanceStatus } from "types/instance";
import { capitalizeFirstLetter } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

interface InstancesDashboardStatusProps {
  status: "running" | "stopped" | "pending" | "error";
  instances: LxdInstance[];
}

const InstancesDashboardStatus: FC<InstancesDashboardStatusProps> = ({
  status,
  instances,
}) => {
  return (
    <div className={`group-by-status ${status}`}>
      <p className="status-label u-text--muted">
        {capitalizeFirstLetter(status)}
      </p>
      <strong className="status-count">{instances.length}</strong>
    </div>
  );
};

interface InstanceAccumulator {
  runningInstances: LxdInstance[];
  stoppedInstances: LxdInstance[];
  pendingInstances: LxdInstance[];
  errorInstances: LxdInstance[];
  containers: LxdInstance[];
  virtualMachines: LxdInstance[];
}

const PENDING_STATUSES = new Set<LxdInstanceStatus>([
  "Restarting",
  "Starting",
  "Stopping",
  "Migrating",
]);
const ERROR_STATUSES = new Set<LxdInstanceStatus>([
  "Error",
  "Freezing",
  "Frozen",
]);

const INITIAL_ACCUMULATOR: InstanceAccumulator = {
  runningInstances: [],
  stoppedInstances: [],
  pendingInstances: [],
  errorInstances: [],
  containers: [],
  virtualMachines: [],
};

const InstancesDashboardContainer: FC = () => {
  const { data: instances = [], error, isLoading } = useInstances(null);
  const { isAuthenticated } = useAuth();
  const isDark = isAuthenticated || isDarkTheme(loadTheme());

  const {
    runningInstances,
    stoppedInstances,
    pendingInstances,
    errorInstances,
    containers,
    virtualMachines,
  } = useMemo(() => {
    if (instances.length === 0) {
      return INITIAL_ACCUMULATOR;
    }

    return instances.reduce<InstanceAccumulator>(
      (accumulator, instance) => {
        const { status, type } = instance;

        if (status === "Running") {
          accumulator.runningInstances.push(instance);
        } else if (status === "Stopped") {
          accumulator.stoppedInstances.push(instance);
        } else if (PENDING_STATUSES.has(status)) {
          accumulator.pendingInstances.push(instance);
        } else if (ERROR_STATUSES.has(status)) {
          accumulator.errorInstances.push(instance);
        }

        if (type === "container") {
          accumulator.containers.push(instance);
        } else if (type === "virtual-machine") {
          accumulator.virtualMachines.push(instance);
        }

        return accumulator;
      },
      {
        runningInstances: [],
        stoppedInstances: [],
        pendingInstances: [],
        errorInstances: [],
        containers: [],
        virtualMachines: [],
      },
    );
  }, [instances]);

  const cardClassName = "overview-card instances";
  const cardTitle = (
    <Link soft href={`${ROOT_PATH}/ui/all-projects/instances`}>
      <Icon name="pods" /> Instances
      {!isLoading && !error && instances.length > 0 && ` (${instances.length})`}
    </Link>
  );
  const vmColorDarkMode = "#B4C6D4";
  const containerColorDarkMode = "#4A5A6A";
  const vmColorLightMode = "#2C3E50";
  const containerColorLightMode = "#7F8C8D";
  const vmColor = isDark ? vmColorDarkMode : vmColorLightMode;
  const containerColor = isDark
    ? containerColorDarkMode
    : containerColorLightMode;

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading instances..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <div className="error-message">
          <Icon name="error" className="margin-right--large" /> Error while
          loading instances: {error.message}
        </div>
      </Card>
    );
  }

  if (instances.length === 0) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <InstanceEmptyState className="u-no-margin" />
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <div className="group-by-status-container">
        <InstancesDashboardStatus
          status="running"
          instances={runningInstances}
        />
        <InstancesDashboardStatus
          status="stopped"
          instances={stoppedInstances}
        />
        <InstancesDashboardStatus
          status="pending"
          instances={pendingInstances}
        />
        <InstancesDashboardStatus status="error" instances={errorInstances} />
      </div>

      <div className="group-by-type-container">
        <DoughnutChart
          segments={[
            {
              color: vmColor,
              tooltip: `${virtualMachines.length} VMs`,
              value: virtualMachines.length,
            },
            {
              color: containerColor,
              tooltip: `${containers.length} containers`,
              value: containers.length,
            },
          ]}
          size={150}
          segmentHoverWidth={45}
          segmentThickness={40}
          chartID="dashboard-instances-by-type-doughnut-chart"
          className="group-by-type-doughnut-chart"
        />
        <span>
          <span
            className="dot"
            style={{
              backgroundColor: vmColor,
            }}
          ></span>
          {virtualMachines.length} VMs &nbsp;| &nbsp;
          <span
            className="dot"
            style={{
              backgroundColor: containerColor,
            }}
          ></span>
          {containers.length} containers
        </span>
      </div>
    </Card>
  );
};

export default InstancesDashboardContainer;
