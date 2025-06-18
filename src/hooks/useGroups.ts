import { useEffect } from "react";
import { useGroupStore } from "../store/groupStore";

export const useUserGroups = (uid: string) => {
  const { myGroups, joinedGroups, fetchGroups, loading } = useGroupStore();

  useEffect(() => {
    if (uid) fetchGroups(uid);
  }, [uid]);

  return { myGroups, joinedGroups, loading };
};