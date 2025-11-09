import { useQuery } from "@apollo/client/react";
import { MeDocument } from "./types";

export const useMe = () => {
  return useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
};

export default useMe;
