import { Outlet } from "react-router-dom";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";

export default function Layout() {
	return (
		<div className="flex justify-center">
			<div className="w-full max-w-[1180px] flex">
				<Sidebar />
				<div className="w-full pb-[24px] px-[12px] lg:pl-[237px]">
					<Header />
					<main className="mt-[104px] md:mt-[148px] pb-[24px]">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
}
