import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { ApolloProvider } from "@apollo/client/react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";

import { App } from "./App";
import client from "./graphql/client";

if (import.meta.env.DEV) {
  loadDevMessages();
  loadErrorMessages();
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
);
