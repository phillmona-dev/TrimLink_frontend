export async function unwrap<T>(promise: Promise<{ data: any }>) {
  try {
    const response = await promise;
    const body = response.data;
    
    // 1. Check if it's a standard ApiResponse wrap { success, data, ... }
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data !== undefined ? body.data : null;
    }
    
    // 2. Otherwise return the raw body (for controllers that don't use the wrap)
    return body !== undefined ? body : null;
  } catch (error) {
    throw error;
  }
}
