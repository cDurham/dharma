import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const LOGOUT_MUTATION = gql`
  mutation logout {
    logout
  }
`;

const useLogout = () => {
  const navigate = useNavigate();
  const [logout, { loading, error }] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logout({
        onCompleted: () => {
          navigate("/");
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
