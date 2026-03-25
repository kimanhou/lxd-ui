import { handleResponse, LxdApiError } from "util/helpers";
import type { LxdOperation, LxdOperationList } from "types/operation";
import type { LxdApiResponse } from "types/apiResponse";
import { ROOT_PATH } from "util/rootPath";

const sortOperationList = (operations: LxdOperationList) => {
  const newestFirst = (a: LxdOperation, b: LxdOperation) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  };
  operations.failure?.sort(newestFirst);
  operations.success?.sort(newestFirst);
  operations.running?.sort(newestFirst);
};

export const fetchOperations = async (
  project: string | null,
): Promise<LxdOperationList> => {
  const params = new URLSearchParams();
  params.set("recursion", "1");
  if (project) {
    params.append("project", project);
  } else {
    params.append("all-projects", "true");
  }

  return fetch(`${ROOT_PATH}/1.0/operations?${params.toString()}`)
    .then(handleResponse)
    .then((data: LxdApiResponse<LxdOperationList>) => {
      sortOperationList(data.metadata);
      return data.metadata;
    });
};

export const cancelOperation = async (id: string): Promise<void> => {
  await fetch(`${ROOT_PATH}/1.0/operations/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).then(handleResponse);
};

export const waitForOperation = async (
  id: string,
  member?: string,
  maxTimeoutMs = 120000,
): Promise<void> => {
  const endpoint = `${ROOT_PATH}/1.0/operations/${encodeURIComponent(id)}`;
  const startTime = Date.now();
  let delay = 500;

  while (true) {
    if (Date.now() - startTime > maxTimeoutMs) {
      const memberPrefix = member ? `[Member: ${member}] ` : "";
      throw new Error(`${memberPrefix}Operation timed out.`);
    }

    try {
      const response = (await fetch(endpoint).then(
        handleResponse,
      )) as LxdApiResponse<LxdOperation>;
      const operation = response.metadata;

      if (operation.status_code === 200) {
        return;
      }

      if (operation.status_code >= 400) {
        throw new Error(
          operation.err ||
            `Operation ${id} failed with status ${operation.status}`,
        );
      }
    } catch (error) {
      if (error instanceof LxdApiError && error.status === 404) {
        const memberPrefix = member ? `[Member: ${member}] ` : "";
        throw new Error(`${memberPrefix}Operation not found on server.`);
      }
      // Re-throw all other errors
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 5000);
  }
};
