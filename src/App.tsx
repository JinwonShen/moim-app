import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import CreateGroup from "./pages/CreateGroup";
import Dashboard from "./pages/Dashboard";
import EmailLogin from "./pages/EmailLogin";
import GroupDetail from "./pages/GroupDetail";
import JoinEmail from "./pages/JoinEmail";
import JoinGroup from "./pages/JoinGroup";
import JoinPhone from "./pages/JoinPhone";
import JoinTerms from "./pages/JoinTerms";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import PinConfirm from "./pages/PinConfirm";
import PinRegister from "./pages/PinRegister";
import Withdraw from "./pages/Withdraw";

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
				{/* <Route path="/floatingbutton" element={<FloatingButton />} /> */}
				<Route path="/mypage" element={<MyPage />} />
				<Route path="/group/create" element={<CreateGroup />} />
				<Route path="/group/:id" element={<GroupDetail />} />
				<Route path="/pinconfirm" element={<PinConfirm />} />
				<Route path="/joingroup" element={<JoinGroup />} />
				<Route path="/withdraw" element={<Withdraw />} />
				<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
			</Routes>
		</Router>
	);
}
