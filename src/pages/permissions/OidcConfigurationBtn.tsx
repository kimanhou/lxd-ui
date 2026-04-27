import type { FC } from "react";
import OidcConfigurationModal from "./OidcConfigurationModal";
import { Button, usePortal } from "@canonical/react-components";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  isDisabled?: boolean;
  className?: string;
}

const OidcConfigurationBtn: FC<Props> = ({ isDisabled, className }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditServerConfiguration } = useServerEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="oidc-configuration-modal">
            <OidcConfigurationModal close={closePortal} />
          </div>
        </Portal>
      )}
      <Button
        onClick={openPortal}
        className={className}
        disabled={isDisabled || !canEditServerConfiguration()}
        title={
          canEditServerConfiguration()
            ? ""
            : "You do not have permission to edit server configuration"
        }
      >
        OIDC configuration
      </Button>
    </>
  );
};

export default OidcConfigurationBtn;
