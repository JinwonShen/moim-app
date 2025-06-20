/**
 * 모임 시작일과 종료일을 기준으로 현재 모임의 상태를 판단하여 반환한다.
 * - 현재 날짜(now)가 시작일 이전이면 "모집중"
 * - 시작일과 종료일 사이면 "진행중"
 * - 종료일 이후면 "모임종료"
 * 각 상태에 따라 상태명(status), 배경색/텍스트 색상(labelColor), 버튼 비활성화 여부(disabled)를 포함한 객체를 반환한다.
 */

export function getGroupStatus(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) {
    return { status: "모집중", labelColor: "bg-white border border-primary text-primary", disabled: false };
  } else if (now >= startDate && now <= endDate) {
    return { status: "진행중", labelColor: "text-white bg-primary", disabled: false };
  } else {
    return { status: "모임종료", labelColor: "text-white bg-gray-300", disabled: true };
  }
}