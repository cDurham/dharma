import { useState, useTransition } from "react";

import useLogout from "./graphql/useLogout";
import { useMutation, useQuery } from "@apollo/client/react";
import { CreateMemberDocument, MembersDocument } from "./graphql/types";

export const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [createMember] = useMutation(CreateMemberDocument);
  const { loading, error, data, refetch } = useQuery(MembersDocument);

  const createMemberAction = async (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    startTransition(async () => {
      try {
        await createMember({
          variables: { data: { firstName, lastName } },
        });
        setIsDialogOpen(false);
        void refetch();
      } catch (error) {
        console.error("Error creating member:", error);
      }
    });
  };

  const handleGetMembers = () => {
    console.log("Fetching members...");
    startTransition(() => {
      void refetch();
    });
  };

  const [handleLogout, { loading: logoutLoading, error: logoutError }] =
    useLogout();

  return (
    <div>
      <button onClick={handleGetMembers} disabled={isPending}>
        {isPending ? "Loading..." : "Fetch Members"}
      </button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.members.map((member) => (
            <li key={member.uuid}>{member.firstName}</li>
          ))}
        </ul>
      )}
      <button onClick={() => void handleLogout()} disabled={logoutLoading}>
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
      {logoutError && <p>Error: {logoutError.message}</p>}

      <button onClick={() => setIsDialogOpen(true)}>Create Member</button>

      {isDialogOpen && (
        <div className="dialog">
          <h2>Create New Member</h2>
          <form action={createMemberAction}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
            />

            <button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
