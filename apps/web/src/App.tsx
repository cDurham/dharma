import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";

export const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/verified"
        element={
          <AppLayout>
            <div>Verified</div>
          </AppLayout>
        }
      />
    </Routes>
  );
};
