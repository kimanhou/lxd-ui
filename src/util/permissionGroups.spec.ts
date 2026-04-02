import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import type { FormPermission } from "types/forms/permissionGroup";
import {
  getCurrentIdentitiesForGroups,
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  isGroupModified,
} from "./permissionGroups";

describe("Permissions util functions for groups page", () => {
  it("getCurrentIdentitiesForGroups", () => {
    const groups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
      {
        name: "group-3",
      },
    ] as LxdAuthGroup[];

    const identities = [
      {
        id: "user-1",
        groups: ["group-1", "group-2", "group-3"],
      },
      {
        id: "user-2",
        groups: ["group-1"],
      },
      {
        id: "user-3",
        groups: [],
      },
    ] as LxdIdentity[];

    const {
      identityIdsInAllGroups,
      identityIdsInSomeGroups,
      identityIdsInNoGroups,
    } = getCurrentIdentitiesForGroups(groups, identities);

    expect(identityIdsInAllGroups).toEqual(["user-1"]);
    expect(identityIdsInSomeGroups).toEqual(["user-2"]);
    expect(identityIdsInNoGroups).toEqual(["user-3"]);
  });

  it("generateGroupAllocationsForIdentities", () => {
    const addedIdentities = new Set(["user-3"]);
    const removedIdentities = new Set(["user-1", "user-2"]);
    const selectedGroups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
    ] as LxdAuthGroup[];
    const addedOrRemovedIdentities = [
      {
        id: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        groups: ["group-2"],
      },
      {
        id: "user-3",
        groups: ["group-3"],
      },
    ] as LxdIdentity[];

    const groupsForIdentities = generateGroupAllocationsForIdentities(
      addedIdentities,
      removedIdentities,
      selectedGroups,
      addedOrRemovedIdentities,
    );

    expect(groupsForIdentities).toEqual({
      "user-1": [],
      "user-2": [],
      "user-3": ["group-3", "group-1", "group-2"],
    });
  });

  it("getChangesInGroupsForIdentities", () => {
    // user action:
    // - remove user-1 from group-1 and group-2
    // - add user-2 and user-3 to group-1 and group-2
    const allIdentities = [
      {
        id: "user-1",
        name: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        name: "user-2",
        groups: ["group-3", "group-4"],
      },
      {
        id: "user-3",
        name: "user-3",
        groups: ["group-2"],
      },
    ] as LxdIdentity[];

    const addedIdentities = new Set(["user-2", "user-3"]);
    const removedIdentities = new Set(["user-1"]);

    const selectedGroups = [
      {
        name: "group-1",
      },
      {
        name: "group-2",
      },
    ] as LxdAuthGroup[];

    const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
      allIdentities,
      selectedGroups,
      addedIdentities,
      removedIdentities,
    );

    expect(identityGroupsChangeSummary).toEqual({
      "user-1": {
        added: new Set([]),
        removed: new Set(["group-1", "group-2"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-1", "group-2"]),
        removed: new Set([]),
        name: "user-2",
      },
      "user-3": {
        added: new Set(["group-1"]),
        removed: new Set([]),
        name: "user-3",
      },
    });
  });

  describe("isGroupModified", () => {
    const baseGroup: LxdAuthGroup = {
      name: "test-group",
      description: "Test description",
      permissions: [
        {
          entity_type: "server",
          url: "/1.0",
          entitlement: "admin",
        },
        {
          entity_type: "project",
          url: "/1.0/projects/default",
          entitlement: "user",
        },
      ],
      identities: { oidc: ["user-1", "user-2"], tls: ["user-3", "user-4"] },
      identity_provider_groups: ["ldap-group"],
      access_entitlements: ["can-edit"],
    };

    const baseGroupPayload = {
      name: "test-group",
      description: "Test description",
      permissions: [
        {
          entity_type: "server",
          url: "/1.0",
          entitlement: "admin",
        },
        {
          entity_type: "project",
          url: "/1.0/projects/default",
          entitlement: "user",
        },
      ] as FormPermission[],
      identities: { oidc: ["user-1", "user-2"], tls: ["user-3", "user-4"] },
      identity_provider_groups: ["ldap-group"],
      access_entitlements: ["can-edit"],
    };

    it("returns false when no changes are made", () => {
      const result = isGroupModified(baseGroupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns false when name is changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        name: "new-name",
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns true when description is changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        description: "New description",
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns false when permissions have extra FormPermission fields but core data is unchanged", () => {
      const groupPayload = {
        ...baseGroupPayload,
        permissions: [
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "admin",
            id: "server-admin-123",
            resourceLabel: "Server Admin",
          },
          {
            entity_type: "project",
            url: "/1.0/projects/default",
            entitlement: "user",
            id: "project-user-456",
            resourceLabel: "Project User",
          },
        ] as FormPermission[],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns true when permissions are actually modified", () => {
      const groupPayload = {
        ...baseGroupPayload,
        permissions: [
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "admin",
            id: "server-admin-123",
            resourceLabel: "Server Admin",
          },
          {
            entity_type: "project",
            url: "/1.0/projects/default",
            entitlement: "operator", // Changed from "user" to "operator"
            id: "project-operator-789",
            resourceLabel: "Project Operator",
          },
        ] as FormPermission[],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns true when permissions are added", () => {
      const groupPayload = {
        ...baseGroupPayload,
        permissions: [
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "admin",
          },
          {
            entity_type: "project",
            url: "/1.0/projects/default",
            entitlement: "user",
          },
          {
            entity_type: "storage-pool",
            url: "/1.0/storage-pools/default",
            entitlement: "user",
            id: "storage-user-new",
            resourceLabel: "Storage User",
          },
        ] as FormPermission[],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns true when permissions are removed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        permissions: [
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "admin",
          },
        ] as FormPermission[], // Missing the project permission
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns false when identities are modified", () => {
      const groupPayload = {
        ...baseGroupPayload,
        identities: { oidc: ["user-1", "user-5"], tls: ["user-3", "user-4"] },
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns false when identities are added", () => {
      const groupPayload = {
        ...baseGroupPayload,
        identities: {
          oidc: ["user-1", "user-2"],
          tls: ["user-3", "user-4", "user-5"],
        },
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns false when identities are removed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        identities: {
          oidc: ["user-2"],
          tls: ["user-3", "user-4"],
        },
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns false when only the order of identities is changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        identities: {
          oidc: ["user-2", "user-1"],
          tls: ["user-3", "user-4"],
        },
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });

    it("returns true when identity_provider_groups are changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        identity_provider_groups: ["new-ldap-group"],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns true when access_entitlements are changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        access_entitlements: ["can-view"],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns true when multiple fields are changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        name: "new-group-name",
        description: "New description",
        permissions: [
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "operator", // Changed entitlement
            resourceLabel: "Server Operator",
          },
        ] as FormPermission[],
        identity_provider_groups: ["new-ldap-group"],
        access_entitlements: ["can-view"],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(true);
    });

    it("returns false when only the order of permissions is changed", () => {
      const groupPayload = {
        ...baseGroupPayload,
        permissions: [
          {
            entity_type: "project",
            url: "/1.0/projects/default",
            entitlement: "user",
          },
          {
            entity_type: "server",
            url: "/1.0",
            entitlement: "admin",
          },
        ] as FormPermission[],
      };

      const result = isGroupModified(groupPayload, baseGroup);
      expect(result).toBe(false);
    });
  });
});
