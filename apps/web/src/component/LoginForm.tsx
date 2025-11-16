import { useMutation } from "@apollo/client/react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useTransition } from "react";

import { CreateUserDocument } from "../graphql/types";
import useLogin from "../graphql/useLogin";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [handleLogin, { loading, error }] = useLogin();
  const [createUser, { loading: signupLoading, error: signupError }] =
    useMutation(CreateUserDocument);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const loginAction = (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      try {
        await handleLogin(email, password);
      } catch (err) {
        console.error("Login failed:", err);
      }
    });
  };

  const signupAction = () => {
    startTransition(async () => {
      try {
        await createUser({
          variables: {
            data: { email, password, firstName, lastName },
          },
        });
        setOpen(false);
      } catch (err) {
        console.error("Signup failed:", err);
      }
    });
  };

  return (
    <form action={loginAction}>
      <Typography variant="h6" gutterBottom>
        Login
      </Typography>
      <TextField
        label="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={loading || isPending}>
        {loading || isPending ? "Logging in..." : "Login"}
      </Button>
      <Button
        onClick={handleOpen}
        variant="outlined"
        disabled={signupLoading || isPending}
      >
        Signup
      </Button>
      {error && <Typography color="error">Login failed</Typography>}
      {signupError && <Typography color="error">Signup failed</Typography>}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Signup</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => void signupAction()}
            color="primary"
            disabled={signupLoading || isPending}
          >
            {signupLoading || isPending ? "Signing up..." : "Signup"}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default LoginForm;
