import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../../service/auth";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: false,
  });
