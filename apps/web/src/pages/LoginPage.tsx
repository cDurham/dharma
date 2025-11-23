import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "../components/ui/alert";
import { Button, buttonVariants } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import type { CreateUserInput } from "../graphql/types";
import useCreateUser from "../graphql/useCreateUser";
import useLogin from "../graphql/useLogin";
import { CreateUserInputSchema } from "../graphql/validators";
import { cn } from "../lib/utils";

const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`;

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

export const LoginPage = () => {
  const [formMode, setFormMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [handleLogin, { loading, error }] = useLogin();
  const [handleCreateUser, { loading: signupLoading, error: signupError }] =
    useCreateUser();
  const [resendVerificationEmail, { loading: resendLoading }] = useMutation<
    ResendVerificationEmailResponse,
    ResendVerificationEmailVars
  >(RESEND_VERIFICATION_EMAIL);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null,
  );
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<
    string | null
  >(null);
  const [signupErrorMessage, setSignupErrorMessage] = useState<string | null>(
    null,
  );

  type SignupFormValues = CreateUserInput & { confirmPassword: string };

  const signupSchema = useMemo(
    () =>
      CreateUserInputSchema()
        .extend({
          confirmPassword: z
            .string()
            .min(1, "Please confirm your password")
            .min(8, "Password must be at least 8 characters"),
        })
        .superRefine((values, ctx) => {
          if (values.password !== values.confirmPassword) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["confirmPassword"],
              message: "Passwords must match",
            });
          }
        }),
    [],
  );

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = handleSignupSubmit(async (values) => {
    const { confirmPassword: _confirmPassword, ...userData } = values;
    setSignupErrorMessage(null);
    setSignupSuccessMessage(null);
    try {
      await handleCreateUser(userData);
      setSignupSuccessMessage(
        "Account created! Please verify your email before logging in.",
      );
      setFormMode("login");
      setEmail(userData.email);
      setPassword("");
      resetSignupForm();
    } catch (err) {
      setSignupErrorMessage(getErrorMessage(err));
    }
  });

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

  const switchToSignup = () => {
    setSignupErrorMessage(null);
    setSignupSuccessMessage(null);
    resetSignupForm();
    setFormMode("signup");
  };

  const switchToLogin = () => {
    setSignupErrorMessage(null);
    setFormMode("login");
  };

  const signupSubmissionError =
    signupErrorMessage ?? (signupError ? getErrorMessage(signupError) : null);

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="space-y-6">
          {/* Placeholder for dharma wheel icon */}
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-background rounded-full" />
          </div>

          <h1 className="text-2xl font-normal text-center">
            Sangha Admin Portal
          </h1>
        </CardHeader>

        <CardContent>
          {formMode === "login" ? (
            <form action={loginAction} className="space-y-4">
              {signupSuccessMessage && (
                <Alert>
                  <AlertDescription>{signupSuccessMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Messages */}
              {(loginErrorMessage || error) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {loginErrorMessage ?? "Login failed"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Unverified Email Flow */}
              {unverifiedEmail && (
                <Alert>
                  <AlertDescription className="space-y-2">
                    <p>
                      Your email is not verified. Resend the verification email?
                    </p>
                    <Button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "h-auto p-0 text-primary",
                      )}
                      onClick={() => void handleResendVerification()}
                      disabled={resendLoading || isPending}
                    >
                      {resendLoading
                        ? "Sending..."
                        : "Resend verification email"}
                    </Button>
                    {resendStatus && <p className="text-sm">{resendStatus}</p>}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || isPending}
              >
                {loading || isPending ? "Logging in..." : "Login"}
              </Button>

              {/* Switch to Signup */}
              <Button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                onClick={switchToSignup}
              >
                Need an account? Sign up
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...registerSignup("firstName")}
                  />
                  {signupErrors.firstName && (
                    <p className="text-xs text-destructive">
                      {signupErrors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    {...registerSignup("lastName")}
                  />
                  {signupErrors.lastName && (
                    <p className="text-xs text-destructive">
                      {signupErrors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Email Address"
                  {...registerSignup("email")}
                />
                {signupErrors.email && (
                  <p className="text-xs text-destructive">
                    {signupErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Password"
                  {...registerSignup("password")}
                />
                {signupErrors.password && (
                  <p className="text-xs text-destructive">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  {...registerSignup("confirmPassword")}
                />
                {signupErrors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {signupErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {signupSubmissionError && (
                <Alert variant="destructive">
                  <AlertDescription>{signupSubmissionError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupLoading || isPending}
                >
                  {signupLoading || isPending
                    ? "Creating account..."
                    : "Sign up"}
                </Button>
                <Button
                  type="button"
                  className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
                  onClick={switchToLogin}
                >
                  Back to login
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex-col">
          <Separator className="mb-4" />
          <div className="text-center text-xs text-muted-foreground">
            © 2024 Sangha Operations |{" "}
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="hover:text-foreground transition-colors"
            >
              Privacy & Terms
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
