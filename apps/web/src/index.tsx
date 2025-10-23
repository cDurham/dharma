import { ApolloProvider } from "@apollo/client";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import client from "./graphql/client";

if (import.meta.env.DEV) {
  loadDevMessages();
  loadErrorMessages();
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);
