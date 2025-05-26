import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import EmailLogin from "./pages/EmailLogin";
import JoinEmail from "./pages/JoinEmail";
import JoinPhone from "./pages/JoinPhone";
import JoinTerms from "./pages/JoinTerms";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import PinConfirm from "./pages/PinConfirm";
import PinRegister from "./pages/PinRegister";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path="/login" element={<Login />} />
				<Route path="/emaillogin" element={<EmailLogin />} />
				<Route path="/jointerms" element={<JoinTerms />} />
				<Route path="/joinphone" element={<JoinPhone />} />
				<Route path="/joinemail" element={<JoinEmail />} />
				<Route path="/pinregister" element={<PinRegister />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/mypage" element={<MyPage />} />
				<Route path="/pinconfirm" element={<PinConfirm />} />
				<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
			</Routes>
		</Router>
	);
}
