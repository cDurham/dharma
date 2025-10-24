import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import useLogin from "../graphql/useLogin";
import { useCreateUserMutation } from "../graphql/generated";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handleLogin, { loading, error }] = useLogin();
  const [createUser, { loading: signupLoading, error: signupError }] =
    useCreateUserMutation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignupSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await createUser({
        variables: {
          data: { email, password, firstName, lastName },
        },
      });
    } catch (err) {
      // Display error message to the user
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await handleLogin(email, password);
      // if (response.data.login.verificationToken !== null) {
      //   // Display error message if email is not verified
      //   alert("Please verify your email to login.");
      // }
    } catch (err) {
      // Display error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Login
      </Typography>
      <TextField
        label="email"
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
      <Button type="submit" variant="contained" disabled={loading}>
        Login
      </Button>
      <Button onClick={handleOpen} variant="outlined" disabled={signupLoading}>
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
            onClick={handleSignupSubmit}
            color="primary"
            disabled={signupLoading}
          >
            Signup
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default LoginForm;
