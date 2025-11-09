import { useState } from "react";

import { useCreateMemberMutation, useMembersQuery } from "./graphql/generated";
import useLogout from "./graphql/useLogout";

export const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [createMember] = useCreateMemberMutation();
  const { loading, error, data, refetch } = useMembersQuery({
    fetchPolicy: "network-only",
    skip: true, // Don't fetch on mount
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMember({
        variables: { data: { firstName, lastName } },
      });
      setIsDialogOpen(false);
      setFirstName("");
      setLastName("");
      refetch(); // Refresh the member list
    } catch (error) {
      console.error("Error creating member:", error);
    }
  };

  const handleGetMembers = () => {
    console.log("Fetching members...");
    refetch();
  };

  const [handleLogout, { loading: logoutLoading, error: logoutError }] =
    useLogout();

  return (
    <div>
      <button onClick={handleGetMembers}>Fetch Members</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.members.map((member) => (
            <li key={member.uuid}>{member.firstName}</li>
          ))}
        </ul>
      )}
      <button onClick={handleLogout} disabled={logoutLoading}>
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
      {logoutError && <p>Error: {logoutError.message}</p>}

      <button onClick={() => setIsDialogOpen(true)}>Create Member</button>

      {isDialogOpen && (
        <div className="dialog">
          <h2>Create New Member</h2>
          <form onSubmit={handleCreateMember}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <button type="submit">Create</button>
            <button type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
