import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Layout() {
	return (
		<div className="flex justify-center">
			<div className="w-full max-w-[1180px] flex">
				<Sidebar />
				<div className="w-full max-w-[1180px] pb-[24px] pl-[12px] lg:pl-[237px]">
					<Header />
					<main className="pr-[12px] mt-[104px] md:mt-[148px] pb-[24px]">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
}
