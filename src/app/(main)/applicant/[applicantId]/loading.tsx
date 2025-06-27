import { Loading } from "@/components/ui/loading";

export default function ApplicantDetailsLoading() {
  return (
    <Loading 
      variant="page" 
      text="Loading applicant details" 
      icon="user"
    />
  );
}
