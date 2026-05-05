import { type FC } from "react";
import {
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
  MainTable,
  EmptyState,
  Icon,
  Button,
  Col,
  List,
} from "@canonical/react-components";
import useSortTableData from "util/useSortTableData";
import { useReplicators } from "context/useReplicators";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import { Link, useSearchParams } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import { useCurrentProject } from "context/useCurrentProject";
import { ALL_PROJECTS } from "util/projects";
import { ReplicatorStatus } from "pages/replicators/ReplicatorStatus";
import { CreateReplicatorButton } from "./actions/CreateReplicatorButton";
import { RunReplicatorBtn } from "./actions/RunReplicatorBtn";
import { EditReplicatorBtn } from "./actions/EditReplicatorBtn";
import { DeleteReplicatorBtn } from "./actions/DeleteReplicatorBtn";
import DocLink from "components/DocLink";

const ReplicatorsList: FC = () => {
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const { project } = useCurrentProject();

  const { data: replicators = [], error, isLoading } = useReplicators();

  if (error) {
    notify.failure("Loading replicators failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name", className: "name", title: "Name" },
    {
      content: "Status",
      className: "status",
      title: "Status",
    },
    ...(project?.name === ALL_PROJECTS
      ? [
          {
            content: "Project",
            sortKey: "project",
            className: "project",
            title: "Project",
          },
        ]
      : []),
    {
      content: "Last run at",
      sortKey: "lastRunAt",
      className: "last-run",
      title: "Last run at",
    },
    {
      content: "Actions",
      className: "actions u-align--right",
      title: "Actions",
    },
  ];

  const queries = searchParams
    .getAll("query")
    .map((value) => value.toLowerCase());

  const filteredReplicators = replicators.filter((item) => {
    const description = item.description ?? "";
    const cluster = item.config?.cluster ?? "";

    return (
      !queries.length ||
      queries.some(
        (query) =>
          description.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          cluster.toLowerCase().includes(query) ||
          item.project.toLowerCase().includes(query),
      )
    );
  });

  const rows = filteredReplicators.map((replicator) => {
    const columns = [
      {
        content: (
          <Link
            to={`${ROOT_PATH}/ui/replicator/${encodeURIComponent(replicator.name)}`}
            className="u-truncate"
          >
            {replicator.name}
          </Link>
        ),
        role: "rowheader",
        "aria-label": "Name",
        title: `Replicator ${replicator.name}`,
        className: "name",
      },
      {
        content: <ReplicatorStatus replicator={replicator} />,
        role: "cell",
        "aria-label": "Status",
        className: "status",
      },
      ...(project?.name === ALL_PROJECTS
        ? [
            {
              content: (
                <div className="u-truncate" title={replicator.project}>
                  {replicator.project}
                </div>
              ),
              role: "cell" as const,
              "aria-label": "Project",
              className: "project",
            },
          ]
        : []),
      {
        content: (
          <div className="u-truncate">
            {replicator.lastRunAt
              ? new Date(replicator.lastRunAt).toLocaleString()
              : "-"}
          </div>
        ),
        role: "cell",
        "aria-label": "Last run at",
        className: "last-run",
      },
      {
        content: (
          <List
            inline
            className="actions-list"
            items={[
              <RunReplicatorBtn key="run" replicator={replicator} />,
              <EditReplicatorBtn key="edit" replicator={replicator} />,
              <DeleteReplicatorBtn key="delete" replicator={replicator} />,
            ]}
          />
        ),
        role: "cell",
        "aria-label": "Actions",
        className: "actions u-align--right",
      },
    ];

    return {
      key: replicator.name,
      name: replicator.name,
      columns,
      sortData: {
        name: replicator.name.toLowerCase(),
        project: replicator.project.toLowerCase(),
        lastRunAt: replicator.lastRunAt || "",
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  const hasReplicators = isLoading || replicators.length > 0;

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    if (rows.length === 0) {
      return "Showing 0 replicators";
    }
    return rows.length > 1
      ? `Showing all ${rows.length} replicators`
      : `Showing 1 out of 1 replicator`;
  };

  const getEmptyStateMsg = () => {
    if (project?.name === ALL_PROJECTS) {
      return "There are no replicators in any project.";
    }
    return "There are no replicators in this project. Create your first replicator!";
  };

  return (
    <CustomLayout
      contentClassName="u-no-padding--bottom"
      mainClassName="replicator-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/clustering/"
                title="Learn more about replicators"
              >
                Replicators
              </HelpLink>
            </PageHeader.Title>
            {replicators.length > 0 && (
              <PageHeader.Search>
                {/* Search component will be added later */}
              </PageHeader.Search>
            )}
          </PageHeader.Left>
          {hasReplicators && (
            <PageHeader.BaseActions>
              <CreateReplicatorButton />
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        <Col size={12}>
          {hasReplicators && (
            <ScrollableTable
              dependencies={[replicators]}
              tableId="replicators-table"
              belowIds={["status-bar"]}
            >
              <TablePagination
                data={sortedRows}
                id="pagination"
                className="u-no-margin--top"
                itemName="replicator"
                aria-label="Table pagination control"
                description={getTablePaginationDescription()}
              >
                <MainTable
                  id="replicators-table"
                  className="replicator-table"
                  defaultSort="Name"
                  headers={headers}
                  rows={rows}
                  sortable
                  emptyStateMsg={getEmptyStateMsg()}
                  onUpdateSort={updateSort}
                />
              </TablePagination>
            </ScrollableTable>
          )}
          {!hasReplicators && (
            <EmptyState
              className="empty-state"
              image={<Icon name="connected" className="empty-state-icon" />}
              title="No replicators found"
            >
              <p>{getEmptyStateMsg()}</p>
              <p>
                <DocLink docPath="/clustering/" hasExternalIcon>
                  How to configure replication
                </DocLink>
              </p>
              <Button
                className="empty-state-button"
                appearance="positive"
                onClick={() => {
                  // TODO: Navigate to create replicator page when implemented
                  console.log("Create replicator clicked");
                }}
              >
                Create replicator
              </Button>
            </EmptyState>
          )}
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default ReplicatorsList;
