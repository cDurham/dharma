import { gql } from "@apollo/client";
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

const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;

const LoginForm = () => {
  type ResendVerificationEmailResponse = {
    resendVerificationEmail: boolean;
  };
  type ResendVerificationEmailVars = { email: string };

  type ApolloLikeError = {
    message?: string;
    graphQLErrors?: Array<{ message?: string }>;
  };

  const isApolloLikeError = (err: unknown): err is ApolloLikeError => {
    if (typeof err !== "object" || err === null) return false;
    const maybeError = err as ApolloLikeError;
    return (
      typeof maybeError.message === "string" ||
      Array.isArray(maybeError.graphQLErrors)
    );
  };

  const includesUnverified = (value?: string) =>
    typeof value === "string" &&
    value.toLowerCase().includes("email not verified");

  const getErrorMessage = (err: unknown) => {
    if (isApolloLikeError(err) && err.message) return err.message;
    if (err instanceof Error) return err.message;
    return "Something went wrong";
  };

  const isUnverifiedError = (err: unknown) => {
    if (isApolloLikeError(err)) {
      const graphQlMatches =
        err.graphQLErrors?.some((gqlErr) => includesUnverified(gqlErr.message)) ??
        false;
      const messageMatches = includesUnverified(err.message);
      return graphQlMatches || messageMatches;
    }
    if (err instanceof Error) {
      return includesUnverified(err.message);
    }
    return false;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [handleLogin, { loading, error }] = useLogin();
  const [createUser, { loading: signupLoading, error: signupError }] =
    useMutation(CreateUserDocument);
  const [resendVerificationEmail, { loading: resendLoading }] = useMutation<
    ResendVerificationEmailResponse,
    ResendVerificationEmailVars
  >(RESEND_VERIFICATION_EMAIL);
  const [open, setOpen] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null,
  );
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

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
        setLoginErrorMessage(null);
        setUnverifiedEmail(null);
        setResendStatus(null);
        await handleLogin(email, password);
      } catch (err) {
        console.error("Login failed:", err);
        const message = getErrorMessage(err);
        setLoginErrorMessage(message);
        if (isUnverifiedError(err)) {
          setUnverifiedEmail(email);
        }
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

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      setResendStatus(null);
      const { data } = await resendVerificationEmail({
        variables: { email: unverifiedEmail },
      });
      if (data?.resendVerificationEmail) {
        setResendStatus("Verification email sent. Check your inbox.");
      } else {
        setResendStatus("Unable to send verification email. Try again later.");
      }
    } catch (err) {
      setResendStatus(getErrorMessage(err));
    }
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
      {(loginErrorMessage || error) && (
        <Typography color="error">
          {loginErrorMessage ?? "Login failed"}
        </Typography>
      )}
      {unverifiedEmail && (
        <>
          <Typography variant="body2" color="textSecondary">
            Your email is not verified. Resend the verification email?
          </Typography>
          <Button
            onClick={() => void handleResendVerification()}
            variant="outlined"
            disabled={resendLoading || isPending}
            sx={{ mt: 1 }}
          >
            {resendLoading ? "Sending..." : "Resend verification email"}
          </Button>
          {resendStatus && (
            <Typography variant="body2" color="textSecondary">
              {resendStatus}
            </Typography>
          )}
        </>
      )}
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
