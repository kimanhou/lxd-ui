import type { FC, KeyboardEvent } from "react";
import { Modal } from "@canonical/react-components";
import OidcConfigurationForm from "./OidcConfigurationForm";

interface Props {
  close: () => void;
}

const OidcConfigurationModal: FC<Props> = ({ close }) => {
  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  return (
    <Modal
      close={close}
      className="edit-oidc-config settings"
      title="OIDC configuration"
      onKeyDown={handleEscKey}
    >
      <OidcConfigurationForm />
    </Modal>
  );
};

export default OidcConfigurationModal;
