import type { FC, ReactNode } from "react";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  MainTable,
  Notification,
  ScrollableTable,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchConfigOptions } from "api/server";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useClusteredSettings } from "context/useSettings";
import { getSettingRow } from "pages/settings/SettingsRow";
import { toConfigFields } from "util/config";
import { useServerEntitlements } from "util/entitlements/server";
import { queryKeys } from "util/queryKeys";
import { getConfigFieldClusteredValue } from "util/settings";

interface Props {
  children?: ReactNode;
}

const OidcConfigurationForm: FC<Props> = () => {
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();
  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const { data: clusteredSettings = [], error: clusterError } =
    useClusteredSettings();
  const { canEditServerConfiguration } = useServerEntitlements();

  if (clusterError) {
    notify.failure("Loading clustered settings failed", clusterError);
  }

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (settingsError) {
    notify.failure("Loading settings failed", settingsError);
  }

  const headers = [{ content: "Key", className: "key" }, { content: "Value" }];
  const configFields = toConfigFields(configOptions?.configs?.server ?? {});
  const rows: MainTableRow[] = configFields
    .filter((t) => t.key.startsWith("oidc"))
    .map((configField) => {
      const clusteredValue = getConfigFieldClusteredValue(
        clusteredSettings,
        configField,
      );

      return getSettingRow(
        configField,
        false,
        clusteredValue,
        () => {},
        settings,
        true,
      );
    });

  return (
    <>
      {!canEditServerConfiguration() && (
        <Notification
          severity="caution"
          title="Restricted permissions"
          titleElement="h2"
        >
          You do not have permission to view or edit server settings
        </Notification>
      )}
      {!hasMetadataConfiguration && canEditServerConfiguration() && (
        <Notification
          severity="information"
          title="Get more server settings"
          titleElement="h2"
        >
          Update to LXD v5.19.0 or later to access more server settings
        </Notification>
      )}
      <NotificationRow className="u-no-padding" />
      {canEditServerConfiguration() && (
        <ScrollableTable
          dependencies={[notify.notification, rows]}
          tableId="settings-table"
        >
          <MainTable
            id="oidc-configuration-table"
            headers={headers}
            rows={rows}
            emptyStateMsg="No data to display"
          />
        </ScrollableTable>
      )}
    </>
  );
};

export default OidcConfigurationForm;
