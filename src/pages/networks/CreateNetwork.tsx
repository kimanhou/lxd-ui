import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  Row,
  useNotify,
  useToastNotification,
  Spinner,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { createClusterNetwork, createNetwork } from "api/networks";
import type { NetworkFormValues } from "types/forms/network";
import NetworkForm, {
  isNetworkFormInvalid,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import NotificationRow from "components/NotificationRow";
import { useSettings } from "context/useSettings";
import { objectToYaml, yamlToObject } from "util/yaml";
import { isClusteredServer, supportsOvnNetwork } from "util/settings";
import BaseLayout from "components/BaseLayout";
import {
  GENERAL,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import YamlSwitch from "components/forms/YamlSwitch";
import { bridgeType, ovnType } from "util/networks";
import { scrollToElement } from "util/scroll";
import { useClusterMembers } from "context/useClusterMembers";
import { useEventQueue } from "context/eventQueue";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import NetworkRichChip from "./NetworkRichChip";

const CreateNetwork: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(GENERAL));
  const controllerState = useState<AbortController | null>(null);
  const { data: settings, isLoading } = useSettings();
  const isClustered = isClusteredServer(settings);
  const hasOvn = supportsOvnNetwork(settings);
  const { data: clusterMembers = [] } = useClusterMembers();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  if (!project) {
    return <>Missing project</>;
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        async (value) =>
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("Network name is required"),
  });

  const onSuccess = (networkName: string) => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.projects, project, queryKeys.networks],
    });
    navigate(`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/networks`);
    toastNotify.success(
      <>
        Network{" "}
        <NetworkRichChip networkName={networkName} projectName={project} />{" "}
        created.
      </>,
    );
  };

  const formik = useFormik<NetworkFormValues>({
    initialValues: {
      readOnly: false,
      isCreating: true,
      name: "",
      networkType: hasOvn ? ovnType : bridgeType,
      entityType: "network",
      ipv4_address: "auto",
      ipv6_address: "auto",
      security_acls: [],
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const network = values.yaml
        ? yamlToObject(values.yaml)
        : toNetwork(values);

      const mutation =
        isClustered && values.networkType !== ovnType
          ? async () =>
              createClusterNetwork(
                network,
                project,
                clusterMembers,
                values.parentPerClusterMember,
                values.bridge_external_interfaces_per_member,
              )
          : async () => createNetwork(network, project);

      mutation()
        .then((operation) => {
          if (hasStorageAndNetworkOperations && operation.metadata.id) {
            toastNotify.info(
              <>
                Creation of network{" "}
                <NetworkRichChip
                  networkName={values.name}
                  projectName={project}
                />{" "}
                has started.
              </>,
            );

            eventQueue.set(
              operation.metadata.id,
              () => {
                formik.setSubmitting(false);
                onSuccess(values.name);
              },
              (msg) => {
                formik.setSubmitting(false);
                toastNotify.failure(
                  `Creation of network ${values.name} failed`,
                  new Error(msg),
                );
              },
            );
          } else {
            formik.setSubmitting(false);
            onSuccess(values.name);
          }
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network creation failed", e);
        });
    },
  });

  const getYaml = () => {
    const payload = toNetwork(formik.values);
    return objectToYaml(payload);
  };

  const updateSection = (newSection: string, source: "scroll" | "click") => {
    setSection(slugify(newSection));
    if (source === "click") {
      scrollToElement(slugify(newSection));
    }
  };

  return (
    <BaseLayout title="Create a network" contentClassName="create-network">
      <Row>
        <NotificationRow />
        <NetworkForm
          key={formik.values.networkType}
          formik={formik}
          getYaml={getYaml}
          project={project}
          section={section}
          setSection={updateSection}
        />
      </Row>
      <FormFooterLayout>
        <div className="yaml-switch">
          <YamlSwitch
            formik={formik}
            section={section}
            setSection={() => {
              updateSection(
                section === slugify(YAML_CONFIGURATION)
                  ? GENERAL
                  : YAML_CONFIGURATION,
                "click",
              );
            }}
            disableReason={
              formik.values.name
                ? undefined
                : "Please enter a network name to enable this section"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(
              `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/networks`,
            )
          }
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            isNetworkFormInvalid(formik, clusterMembers) || formik.isSubmitting
          }
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetwork;
