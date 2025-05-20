import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import EmailLogin from "./pages/EmailLogin";
import JoinEmail from "./pages/JoinEmail";
import JoinPhone from "./pages/JoinPhone";
import JoinTerms from "./pages/JoinTerms";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
// 나중에 추가할 페이지들 (예시)
// import Dashboard from './pages/Dashboard';
// import PinAuth from './pages/PinAuth';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/EmailLogin" element={<EmailLogin />} />
				{/* <Route path="/SignUp" element={<SignUp />} /> */}
				<Route path="/JoinTerms" element={<JoinTerms />} />
				<Route path="/JoinPhone" element={<JoinPhone />} />
				<Route path="/JoinEmail" element={<JoinEmail />} />
				{/* <Route path="/dashboard" element={<Dashboard />} /> */}
				{/* <Route path="/pin-auth" element={<PinAuth />} /> */}
				<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
			</Routes>
		</Router>
	);
}
