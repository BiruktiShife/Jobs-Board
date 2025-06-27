import { Loading } from "@/components/ui/loading";

export default function ApplicantsListLoading() {
  return (
    <Loading 
      variant="page" 
      text="Loading applicants" 
      icon="users"
    />
  );
}
