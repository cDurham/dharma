import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { LogoutDocument } from "./types";

const useLogout = () => {
  const navigate = useNavigate();
  const [logout, { loading, error }] = useMutation(LogoutDocument);

  const handleLogout = async () => {
    try {
      await logout({
        onCompleted: () => {
          void navigate("/");
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return [handleLogout, { loading, error }] as const;
};

export default useLogout;
