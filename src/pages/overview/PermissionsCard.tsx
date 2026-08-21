import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Spinner } from "@canonical/react-components";
import ListPipe from "components/ListPipe";
import { useAuth } from "context/auth";
import { ROOT_PATH } from "util/rootPath";

const PermissionsCard: FC = () => {
  const { effectiveGroups, isAuthLoading } = useAuth();

  if (effectiveGroups?.includes("admins")) {
    return null;
  }

  const cardClassName = "overview-card permissions";
  const cardTitle = (
    <>
      <Icon name="user" /> Permissions
    </>
  );

  if (isAuthLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner className="u-loader" text="Loading permissions..." />
      </Card>
    );
  }

  return (
    <Card className={cardClassName} title={cardTitle}>
      <p className="u-no-margin--bottom">
        Overview information is filtered by your permission groups.
      </p>
      <p>
        Your groups:{" "}
        {effectiveGroups?.length ? (
          <ListPipe items={effectiveGroups} />
        ) : (
          <span className="u-text--muted">-</span>
        )}
      </p>
      <div className="card-footer">
        <Link to={`${ROOT_PATH}/ui/permissions/identities`}>
          See identities
        </Link>
      </div>
    </Card>
  );
};

export default PermissionsCard;
