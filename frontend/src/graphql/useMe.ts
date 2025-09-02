import { useMeQuery } from "./generated";

export const useMe = () => {
  return useMeQuery({
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
};

export default useMe;
