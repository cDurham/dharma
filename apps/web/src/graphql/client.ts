import {
  ApolloClient,
  type ApolloLink,
  CombinedGraphQLErrors,
  from,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { RefreshAccessTokenDocument } from "./types";

const httpLink = new HttpLink({
  credentials: "include",
  uri: "http://localhost:3000/graphql",
});

// Single-flight: concurrent 401s must not race the rotating refresh token.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= client
    .mutate({ mutation: RefreshAccessTokenDocument })
    .then(({ data }) => data?.refreshAccessToken === true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

function redirectToLogin() {
  if (window.location.pathname !== "/") {
    window.location.assign("/");
  }
}

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return;
  }
  const unauthenticated = error.errors.some(
    (item) => item.extensions?.code === "UNAUTHENTICATED",
  );
  if (!unauthenticated) {
    return;
  }
  // The refresh mutation's own failure must not trigger another refresh.
  if (operation.operationName === "RefreshAccessToken") {
    return;
  }
  if (operation.getContext().refreshRetried) {
    redirectToLogin();
    return;
  }
  return new Observable<ApolloLink.Result>((observer) => {
    refreshSession()
      .then((refreshed) => {
        if (!refreshed) {
          redirectToLogin();
          observer.error(error);
          return;
        }
        operation.setContext({ refreshRetried: true });
        forward(operation).subscribe(observer);
      })
      .catch((refreshError: unknown) => observer.error(refreshError));
  });
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
