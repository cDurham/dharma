import { Route, Routes } from "react-router-dom";
import LoginForm from "./component/LoginForm";
import { Dashboard } from "./Dashboard";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/verified" element={<div>Verified</div>} />
    </Routes>
  );
};
