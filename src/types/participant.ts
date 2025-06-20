export interface Participant {
	uid: string; // 해당 참여자의 고유 사용자 ID (Firebase UID 등)
	isOwner: boolean; // 이 사용자가 해당 모임의 모임장인지 여부를 나타냄
	nickname?: string; // 선택적 필드로, 참여자의 닉네임 (필수가 아닐 수 있음)
}