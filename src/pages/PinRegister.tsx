import bcrypt from "bcryptjs";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";

export default function PinRegister() {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>([]);
  const uid = useAuthStore((state) => state.user?.uid);
  const location = useLocation();

  // 📌 모드: "register" 또는 "changePin"
  const mode: "register" | "changePin" =
    location.state?.mode === "changePin" ? "changePin" : "register";

  const fromPath =
    mode === "changePin"
      ? "/mypage" // 핀 변경 시 리디렉션
      : location.state?.from || "/dashboard"; // 회원가입 시 리디렉션

  const handleClick = (digit: string) => {
    if (pin.length < 6) setPin([...pin, digit]);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 6 || !uid) return;

    try {
      const finalPin = pin.join("");
      const hashedPin = await bcrypt.hash(finalPin, 10);

      await updateDoc(doc(db, "users", uid), { pinHash: hashedPin });
      sessionStorage.setItem("pin_verified", "true");

      alert(
        mode === "changePin"
          ? "PIN이 성공적으로 변경되었습니다."
          : "PIN이 성공적으로 등록되었습니다."
      );

      navigate(fromPath);
    } catch (error) {
      console.error("PIN 저장 실패: ", error);
      alert("PIN 저장 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[375px]">
        <h2 className="text-[24px] font-bold mb-[48px]">
          6자리 PIN 번호를 설정해주세요
        </h2>

        {/* ● PIN 입력 상태 시각화 */}
        <div className="flex justify-center gap-[12px] mb-[60px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`pin-${i}-${pin[i] ?? "empty"}`}
              className={`w-[16px] h-[16px] rounded-full border-2 ${
                pin[i] ? "bg-primary border-primary" : "border-primary"
              }`}
            />
          ))}
        </div>

        {/* ● 키패드 */}
        <div className="w-full max-w-[375px] grid grid-cols-3 gap-[8px]">
          {[..."123456789"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleClick(num)}
              className="h-[48px] text-xl bg-gray-100 rounded hover:bg-gray-200"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 text-xl bg-gray-100 rounded hover:bg-gray-200"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleClick("0")}
            className="h-12 text-xl bg-gray-100 rounded hover:bg-gray-200"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length !== 6}
            className={`h-12 text-sm rounded ${
              pin.length === 6
                ? "bg-gray-300 hover:bg-primary hover:text-white transition-all duration-300"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            PIN {mode === "changePin" ? "변경" : "등록"} 완료
          </button>
        </div>

        {/* ● 하단 버튼 (회원가입일 때만 표시) */}
        {mode === "register" && (
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-[24px] text-[14px] no-underline text-center hover:underline"
            >
              이전으로
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-[24px] text-[14px] no-underline text-center hover:underline"
            >
              소셜 로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}