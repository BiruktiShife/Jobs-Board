import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <Button
      variant="outline"
      className="w-full md:w-auto justify-start gap-2 "
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
};
