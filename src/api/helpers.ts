import type { ApiResponse } from "@/types";

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  try {
    const response = await promise;
    // v5 of TanStack Query strictly forbids 'undefined' as a return value.
    // If the data field is missing (e.g. backend NON_NULL exclusion), we return null.
    const result = response.data?.data;
    return result !== undefined ? result : null;
  } catch (error) {
    // Re-throw to allow TanStack Query to handle the error state
    throw error;
  }
}
