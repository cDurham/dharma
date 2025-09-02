import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./generated";

gql`
  mutation login($data: ValidateUserInput!) {
    login(data: $data) {
      message
    }
  }
`;

const useLogin = () => {
  const navigate = useNavigate();
  const [login, { loading, error }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    // dunno if we need this with the auth changes?
    try {
      const { data } = await login({
        variables: { data: { email, password } },
        onCompleted: (data) => {
          if (data?.login) {
            navigate("/dashboard");
          }
        },
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return [handleLogin, { loading, error }] as const;
};

export default useLogin;
