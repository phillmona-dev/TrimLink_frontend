import type { ApiResponse } from "@/types";

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const response = await promise;
  return response.data.data;
}
