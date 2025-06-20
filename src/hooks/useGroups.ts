/**
 * 이 훅은 특정 사용자의 모임 데이터를 불러오고 전역 상태로 관리한다.
 * - 사용자의 uid가 주어지면, 자동으로 fetchGroups()를 호출하여
 *   내가 만든 모임(myGroups)과 참여 중인 모임(joinedGroups)을 불러온다.
 * - 전역 상태 스토어(useGroupStore)에서 값을 가져온다.
 */

import { useEffect } from "react";
import { useGroupStore } from "../store/groupStore";

export const useUserGroups = (uid: string) => {
  const { myGroups, joinedGroups, fetchGroups, loading } = useGroupStore();

  useEffect(() => {
    // ✅ uid가 유효할 때, 사용자 모임 데이터를 불러온다
    if (uid) fetchGroups(uid);
  }, [uid]);

  return { myGroups, joinedGroups, loading, fetchGroups };
};