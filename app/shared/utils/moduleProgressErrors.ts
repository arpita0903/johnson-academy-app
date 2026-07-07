const CANCEL_MODULE_ERROR_MESSAGES: Record<string, string> = {
  "Module must be in inprogress status to cancel":
    "This module is no longer in progress.",
  "Cannot cancel a module that has a score":
    "This module can't be undone because it already has a score.",
};

export function getModuleMutationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  let message: string | undefined;

  if (error && typeof error === "object" && "message" in error) {
    message = String((error as { message: string }).message);
  }

  if (message && CANCEL_MODULE_ERROR_MESSAGES[message]) {
    return CANCEL_MODULE_ERROR_MESSAGES[message];
  }

  return message || fallback;
}
