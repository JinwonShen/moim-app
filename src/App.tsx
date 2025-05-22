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
import PinRegister from "./pages/PinRegister";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path="/login" element={<Login />} />
				<Route path="/EmailLogin" element={<EmailLogin />} />
				<Route path="/JoinTerms" element={<JoinTerms />} />
				<Route path="/JoinPhone" element={<JoinPhone />} />
				<Route path="/JoinEmail" element={<JoinEmail />} />
				<Route path="/PinRegister" element={<PinRegister />} />
				<Route path="/Dashboard" element={<Dashboard />} />
				<Route path="*" element={<div>404 - 페이지를 찾을 수 없습니다</div>} />
			</Routes>
		</Router>
	);
}
