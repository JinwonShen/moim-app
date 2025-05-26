import { useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
	useEffect(() => {
		// 대시보드 진입 시 항상 PIN 인증 상태 제거
		sessionStorage.removeItem("pin_verified");
	}, []);

	return (
		<div className="flex">
			<Sidebar />
			<Header />
		</div>
	);
}
