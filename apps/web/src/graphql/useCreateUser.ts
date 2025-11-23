import { useMutation } from "@apollo/client/react";

import type { CreateUserMutation, CreateUserMutationVariables } from "./types";
import { CreateUserDocument } from "./types";

const useCreateUser = () => {
  const [createUser, { loading, error }] = useMutation<
    CreateUserMutation,
    CreateUserMutationVariables
  >(CreateUserDocument);

  const handleCreateUser = async (
    data: CreateUserMutationVariables["data"],
  ) => {
    try {
      const { data: result } = await createUser({
        variables: { data },
      });

      return result?.createUser;
    } catch (err) {
      console.error("Create user failed:", err);
      throw err;
    }
  };

  return [handleCreateUser, { loading, error }] as const;
};

export default useCreateUser;
