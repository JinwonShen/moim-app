import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Layout() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="w-[100vw] pl-[237px] pb-[24px]">
				<Header />
				<main className="pr-[12px] mt-[148px] pb-[24px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
