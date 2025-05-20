import { useState } from "react";

export default function PinRegister() {
	const [pin, setPin] = useState<string>([]);

	const handleClick = (digit: string) => {
		if (pin.length < 6) {
			setPin([...pin, digit]);
		}
	};

	const handleDelete = () => {
		setPin(pin.slice(0, -1));
	};

	const handleSubmit = () => {
		if (pin.length === 6) {
			const finalPin = pin.join("");
			console.log("등록할 PIN: ", finalPin);
		}
	};

	return (
		<div>
			<h2>6자리 PIN 번호를 설정해주세요</h2>
			<div>
				{[...Array(6)].map((_, i) => (
					<span key={i}>{pin[i] ? "●" : "○"}</span>
				))}
			</div>

			<div>
				{[..."123456789"].map((num) => (
					<button key={num} onClick={() => handleClick(num)}>
						{num}
					</button>
				))}
				<button type="button" onClick={handleDelete}>
					←
				</button>
				<button type="button" onClick={() => handleClick("0")}>
					0
				</button>
				<button type="button" disabled={pin.length < 6} onClick={handleSubmit}>
					등록
				</button>
			</div>
		</div>
	);
}
