import { useState, useTransition } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CreateMemberDocument,
  DeleteUserDocument,
  GetUsersDocument,
  MembersDocument,
} from "./graphql/types";
import useLogout from "./graphql/useLogout";

export const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [createMember] = useMutation(CreateMemberDocument);
  const {
    loading: membersLoading,
    error: membersError,
    data: membersData,
    refetch: refetchMembers,
  } = useQuery(MembersDocument);
  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    refetch: refetchUsers,
  } = useQuery(GetUsersDocument);
  const [deleteUser, { loading: deleteUserLoading, error: deleteUserError }] =
    useMutation(DeleteUserDocument);

  const createMemberAction = (formData: FormData) => {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    startTransition(async () => {
      try {
        await createMember({
          variables: { data: { firstName, lastName } },
        });
        setIsDialogOpen(false);
        void refetchMembers();
      } catch (error) {
        console.error("Error creating member:", error);
      }
    });
  };

  const handleGetMembers = () => {
    console.log("Fetching members...");
    startTransition(() => {
      void refetchMembers();
    });
  };

  const handleDeleteUser = (uuid: string) => {
    startTransition(async () => {
      try {
        await deleteUser({ variables: { uuid } });
        await refetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    });
  };

  const handleRefreshUsers = () => {
    startTransition(() => {
      void refetchUsers();
    });
  };

  const [handleLogout, { loading: logoutLoading, error: logoutError }] =
    useLogout();

  return (
    <div>
      <section>
        <h2>Members</h2>
        <button onClick={handleGetMembers} disabled={isPending}>
          {isPending ? "Loading..." : "Fetch Members"}
        </button>
        {membersLoading && <p>Loading members...</p>}
        {membersError && <p>Error: {membersError.message}</p>}
        {membersData && (
          <ul>
            {membersData.members.map((member) => (
              <li key={member.uuid}>{member.firstName}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Users</h2>
        <button onClick={handleRefreshUsers} disabled={isPending}>
          {isPending ? "Loading..." : "Refresh Users"}
        </button>
        {usersLoading && <p>Loading users...</p>}
        {usersError && <p>Error: {usersError.message}</p>}
        {usersData && (
          <ul>
            {usersData.users.map((user) => (
              <li key={user.uuid}>
                {user.firstName} {user.lastName} ({user.email})
                <button
                  onClick={() => handleDeleteUser(user.uuid)}
                  disabled={deleteUserLoading || isPending}
                  style={{ marginLeft: "0.5rem" }}
                >
                  {deleteUserLoading ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteUserError && <p>Error deleting user: {deleteUserError.message}</p>}
      </section>

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
