import type { FC } from "react";
import { Card, Icon } from "@canonical/react-components";

const ClusterCard: FC = () => {
  return (
    <Card
      className="overview-card cluster"
      title={
        <>
          <Icon name="cluster-host" /> Cluster
        </>
      }
    >
      <div>
        <h4>Members (3)</h4>
        <p className="u-text--muted u-text--small">Hidden if not clustered</p>
        <p>Roles: </p>
        <ul>
          <li>
            <strong>1</strong> Leader{" "}
            <span className="u-text--muted">(master)</span>
          </li>
          <li>
            <strong>2</strong> Voters{" "}
            <span className="u-text--muted">(node-02, node-03)</span>
          </li>
        </ul>
        <p>Statuses: ● 2 Online | ○ 1 Offline</p>
      </div>
      <div>
        <h4>Top members by resource</h4>
        <p className="u-text--muted u-text--small">Hidden if not clustered</p>
        <div className="leaderboard-group">
          <h5>Highest memory usage</h5>
          <ol className="leaderboard-list">
            <li className="critical-strain">
              <span className="node-name">node-02</span>{" "}
              <span className="node-value text-danger">
                95.4% <span className="details">(2.1 / 2.2 GiB)</span>
              </span>
            </li>
            <li>
              <span className="node-name">master</span>{" "}
              <span className="node-value">
                14.0% <span className="details">(4.2 / 30.0 GiB)</span>
              </span>
            </li>
            <li>
              <span className="node-name">node-03</span>{" "}
              <span className="node-value">
                10.0% <span className="details">(1.0 / 10.0 GiB)</span>
              </span>
            </li>
          </ol>
        </div>

        <div className="leaderboard-group" style={{ marginTop: "1.5rem" }}>
          <h5>Highest CPU usage</h5>
          <ol className="leaderboard-list">
            <li>
              <span className="node-name">master</span>{" "}
              <span className="node-value">78.2%</span>
            </li>
            <li>
              <span className="node-name">node-02</span>{" "}
              <span className="node-value">41.5%</span>
            </li>
            <li>
              <span className="node-name u-text--muted">
                {" "}
                node-03 (Offline)
              </span>
              <span className="node-value u-text--muted">--</span>
            </li>
          </ol>
        </div>
      </div>
      <div>
        <h4>Cluster resources</h4>
        <p>Total memory usage</p>
        <p>Total disk usage</p>
      </div>
    </Card>
  );
};

export default ClusterCard;
