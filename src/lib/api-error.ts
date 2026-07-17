import { NextResponse } from "next/server";

export function apiErrorResponse(
  message: string,
  error: unknown,
  status = 500,
) {
  console.error(error);
  const resolvedStatus = isDatabaseUnavailableError(error) ? 503 : status;

  return NextResponse.json(
    {
      error: resolvedStatus === 503 ? "Database is unavailable" : message,
      ...(process.env.NODE_ENV !== "production"
        ? { details: getErrorMessage(error) }
        : {}),
    },
    { status: resolvedStatus },
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isDatabaseUnavailableError(error: unknown) {
  const message = getErrorMessage(error);

  return (
    message.includes("ECONNREFUSED") ||
    message.includes("Can't reach database server") ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ECONNREFUSED")
  );
}
