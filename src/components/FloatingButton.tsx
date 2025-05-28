import { FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function FloatingButton() {
	const navigate = useNavigate();
	const location = useLocation();

	const excludedPaths = ["/mypage", "/support", "/contact"];
	if (excludedPaths.includes(location.pathname)) return null;

	return (
		<button
			type="button"
			onClick={() => navigate("/group/create")}
			className="fixed bottom-6 right-6 w-[60px] h-[60px] rounded-full shadow-lg bg-primary text-white hover:opacity-[50%] transition-all duration-300"
		>
			<FiPlus className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-3xl" />
		</button>
	);
}
