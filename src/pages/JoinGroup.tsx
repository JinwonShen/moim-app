import {
	collection,
	doc,
	getDoc,
	getDocs,
	updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

interface Participant {
	id: string;
	nickname: string;
	uid: string | null;
	isOwner: boolean;
}

interface GroupData {
	groupName: string;
	startDate: string;
	endDate: string;
}

export default function JoinGroup() {
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [selected, setSelected] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [groupData, setGroupData] = useState<GroupData | null>(null);

	const [params] = useSearchParams();
	const navigate = useNavigate();
	const groupId = params.get("groupId");

	const user = useAuthStore((state) => state.user);

	// ✅ 로그인 안되어 있으면 로그인 페이지로 이동
	useEffect(() => {
		if (!user) {
			alert("로그인 후 모임에 참가할 수 있습니다.");
			navigate("/login");
		}
	}, [user, navigate]);

	// ✅ group 정보 fetch
	useEffect(() => {
		if (!groupId) return;

		const fetchGroup = async () => {
			try {
				const groupRef = doc(db, "groups", groupId);
				const snap = await getDoc(groupRef);
				if (snap.exists()) {
					setGroupData(snap.data() as GroupData);
				} else {
					alert("해당 모임이 존재하지 않습니다.");
					navigate("/");
				}
			} catch (err) {
				console.error("모임 로딩 오류:", err);
			}
		};

		fetchGroup();
	}, [groupId, navigate]);

	// ✅ participants 하위 컬렉션 fetch
	useEffect(() => {
		if (!groupId) return;

		const fetchParticipants = async () => {
			try {
				const ref = collection(db, "groups", groupId, "participants");
				const snapshot = await getDocs(ref);
				const list: Participant[] = snapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						id: doc.id,
						nickname: data.nickname,
						uid: data.uid ?? null,
						isOwner: data.isOwner ?? false,
					};
				});
				setParticipants(list);
			} catch (err) {
				console.error("참가자 로딩 오류:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchParticipants();
	}, [groupId]);

	const handleJoin = async () => {
		if (!groupId || !selected || !user) return;

		const participantRef = doc(db, "groups", groupId, "participants", selected);
		await updateDoc(participantRef, {
			uid: user.uid,
		});

		alert("참가가 완료되었습니다!");
		navigate(`/group/${groupId}`);
	};

	if (loading) return <p className="text-center">로딩 중...</p>;

	return (
		<div className="max-w-md mx-auto p-6">
			{groupData && (
				<div className="mb-6 text-center">
					<h2 className="text-lg font-bold">{groupData.groupName}</h2>
					<p className="text-sm text-gray-500">
						모임 기간: {groupData.startDate} ~ {groupData.endDate}
					</p>
				</div>
			)}

			<h1 className="text-xl font-bold mb-4">참가자 선택</h1>
			<ul className="mb-4">
				{participants.map((p) => (
					<li key={p.id} className="mb-2">
						<label className="flex items-center gap-2">
							<input
								type="radio"
								name="participant"
								value={p.id}
								disabled={!!p.uid || p.isOwner} // 모임장 or 이미 등록된 참가자는 선택 불가
								checked={selected === p.id}
								onChange={() => setSelected(p.id)}
							/>
							<span>
								{p.nickname} {p.uid && "(모임 장)"}
							</span>
						</label>
					</li>
				))}
			</ul>
			<button
				type="button"
				onClick={handleJoin}
				className="bg-primary text-white px-4 py-2 rounded w-full"
				disabled={!selected}
			>
				참가하기
			</button>
		</div>
	);
}
