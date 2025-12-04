import type { FC } from "react";
import { Row, Col } from "@canonical/react-components";
import { capitalizeFirstLetter } from "util/helpers";
import type { ResourceIconType } from "components/ResourceIcon";
import ResourceIcon from "components/ResourceIcon";

interface Props {
  entityType: string;
  errorMessage?: string;
}

const NotFound: FC<Props> = ({ entityType, errorMessage }) => {
  const url = location.pathname;
  const hasEntityTypeInUrl = url.includes(`/${entityType}/`);
  const entityName = hasEntityTypeInUrl
    ? url.split(`/${entityType}/`)[1]
    : "default";

  return (
    <Row className="empty-state u-no-margin--left">
      <Col size={4} className="u-align--right col-4 col-medium-2 col-small-1">
        <ResourceIcon
          type={entityType as ResourceIconType}
          className="empty-state-icon"
        />
      </Col>
      <Col size={8} className="u-align--left col-8 col-medium-4 col-small-3">
        <p className="p-heading--4 u-no-margin--bottom">
          {capitalizeFirstLetter(entityType)} not found
        </p>
        <p>
          The {entityType} <code>{entityName}</code> is missing or you do not
          have the <code>viewer</code> permission for it.
        </p>
        {errorMessage && <p className="u-text--muted">Error: {errorMessage}</p>}
      </Col>
    </Row>
  );
};

export default NotFound;
