import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      {/* TODO: Add lotus pattern background once assets are ready */}
      {children}
    </div>
  );
};
