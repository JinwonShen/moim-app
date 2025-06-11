// utils/groupStatus.ts
export function getGroupStatus(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) {
    return { status: "모집중", labelColor: "text-primary bg-white border border-primary", disabled: false };
  } else if (now >= startDate && now <= endDate) {
    return { status: "진행중", labelColor: "text-white bg-primary", disabled: false };
  } else {
    return { status: "모임종료", labelColor: "text-white bg-gray-300", disabled: true };
  }
}