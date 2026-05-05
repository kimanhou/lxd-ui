import { handleResponse } from "util/helpers";
import type { LxdReplicator, LxdReplicatorState } from "types/replicator";
import type { LxdApiResponse } from "types/apiResponse";
import { addEntitlements } from "util/entitlements/api";
import { ROOT_PATH } from "util/rootPath";

const replicatorEntitlements = ["can_edit", "can_delete"];

export const fetchReplicators = async (
  project?: string,
  allProjects?: boolean,
  isFineGrained: boolean | null = null,
): Promise<LxdReplicator[]> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");

  if (allProjects) {
    params.set("all-projects", "true");
  } else if (project) {
    params.set("project", project);
  }

  addEntitlements(params, isFineGrained, replicatorEntitlements);

  return fetch(`${ROOT_PATH}/1.0/replicators?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicator[]>) => {
      return data.metadata;
    });
};

export const fetchReplicator = async (
  name: string,
  project: string,
  isFineGrained: boolean | null = null,
): Promise<LxdReplicator> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addEntitlements(params, isFineGrained, replicatorEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicator>) => {
      return data.metadata;
    });
};

export const fetchReplicatorState = async (
  name: string,
  project: string,
  isFineGrained: boolean | null = null,
): Promise<LxdReplicatorState> => {
  const params = new URLSearchParams();
  params.set("project", project);
  addEntitlements(params, isFineGrained, replicatorEntitlements);

  return fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}/state?${params.toString()}`,
  )
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdReplicatorState>) => {
      return data.metadata;
    });
};

export const createReplicator = async (body: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/replicators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const updateReplicator = async (
  name: string,
  body: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then(handleResponse);
};

export const deleteReplicator = async (name: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const renameReplicator = async (
  oldName: string,
  newName: string,
): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/replicators/${encodeURIComponent(oldName)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  }).then(handleResponse);
};

export const runReplicator = async (
  name: string,
  project: string,
  restore = false,
): Promise<void> => {
  const params = new URLSearchParams();
  params.set("project", project);

  const body = restore ? JSON.stringify({ restore: true }) : undefined;

  await fetch(
    `${ROOT_PATH}/1.0/replicators/${encodeURIComponent(name)}/run?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body }),
    },
  ).then(handleResponse);
};
