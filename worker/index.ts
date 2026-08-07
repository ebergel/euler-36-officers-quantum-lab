import appRouter from "vinext/server/app-router-entry";

type RuntimeEnvironment = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

type WorkerContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

/**
 * Six Refuses does not use application-owned APIs or persistence. Vinext's
 * App Router handler serves both the React application and its static assets.
 */
const worker = {
  fetch(
    request: Request,
    environment: RuntimeEnvironment,
    context: WorkerContext,
  ): Promise<Response> {
    return appRouter.fetch(request, environment, context);
  },
};

export default worker;
