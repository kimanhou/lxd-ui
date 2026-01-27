import { type FC } from "react";
import {
  Icon,
  Spinner,
  CustomLayout,
  Notification,
  Card,
} from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import type { AuthMethod } from "util/authentication";
import { isPermanentAuthMethod } from "util/authentication";

const AuthenticationSetup: FC = () => {
  const { isAuthLoading, isAuthenticated, authMethod } = useAuth();
  const query = new URLSearchParams(window.location.search);
  const reason = query.get("reason");

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (isAuthenticated && isPermanentAuthMethod(authMethod as AuthMethod)) {
    return <Navigate to="/ui/permissions/identities" replace={true} />;
  }

  return (
    <CustomLayout contentClassName="authentication-setup u-flex-column">
      <h1 className="p-heading--2 u-sv-1">Set up permanent access</h1>
      {reason === "expired" && (
        <Notification severity="caution">Your token has expired</Notification>
      )}
      {reason === "invalid" && (
        <Notification severity="caution">Your token is invalid</Notification>
      )}
      {!reason && (
        <Notification severity="caution">
          Your token will expire soon
        </Notification>
      )}

      <div className="auth-setup-cards-container">
        <Card className="auth-setup-card">
          <Icon name="security" light className="auth-setup-icon" />
          <h2>SSO</h2>
          <ul>
            <li>Best for production environments</li>
            <li>Centralized access for teams</li>
            <li>Requires an external identity provider</li>
          </ul>
          <a
            className="p-button--positive auth-setup-link"
            href="https://documentation.ubuntu.com/lxd/en/latest/howto/oidc"
            target="_blank"
            rel="noopener noreferrer"
            title="Set up SSO login"
          >
            <span>Set up SSO login</span>
          </a>
        </Card>

        <Card className="auth-setup-card">
          <Icon name="certificate" className="auth-setup-icon" />
          <h2>TLS</h2>
          <ul>
            <li>Best for local development</li>
            <li>Quick setup with a simple browser certificate</li>
            <li>No external server required</li>
          </ul>
          <Link
            className="p-button auth-setup-link"
            to="/ui/login/certificate-generate"
          >
            <span>Set up TLS login</span>
          </Link>
        </Card>
      </div>
    </CustomLayout>
  );
};

export default AuthenticationSetup;
