// Customer-facing wording for failures. Members should never see technical
// details (status codes, stack traces, "Failed to fetch"), only calm guidance.

export const CONNECTION_ERROR = "We couldn't connect to Coastal Shaadi. Please check your internet connection and try again.";
export const SESSION_EXPIRED = 'Your session has expired. Please log in again to continue.';
export const GENERIC_ERROR = "Something didn't go as planned. Please try again in a moment.";

// Message for a failed API response. Server text is only used for 4xx
// responses, which the API words for members; 5xx details stay hidden.
export function apiErrorMessage(res, data, fallback = GENERIC_ERROR) {
  if (res.status === 401) return SESSION_EXPIRED;
  if (res.status >= 500) return fallback;
  return data?.message || fallback;
}

// Throws a customer-ready error when an API response is not successful.
export async function assertOk(res, fallback) {
  if (res.ok) return;
  const data = await res.json().catch(() => ({}));
  throw new Error(apiErrorMessage(res, data, fallback));
}

// Message for a caught exception. Errors thrown by our own code already carry
// customer-ready text; network and parsing failures get friendly wording.
export function errorMessage(err, fallback = CONNECTION_ERROR) {
  if (!err?.message || err instanceof TypeError || err instanceof SyntaxError) return fallback;
  return err.message;
}
