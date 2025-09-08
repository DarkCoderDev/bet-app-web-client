import React from "react";
import { toast, Toaster } from "react-hot-toast";

const PASSWORD = import.meta.env.VITE_APP_PASSWORD as string;

interface AuthProps {
  children: React.ReactNode;
}

export const Auth: React.FC<AuthProps> = ({ children }) => {
  const [authed, setAuthed] = React.useState<boolean>(() => {
    return localStorage.getItem("authed") === "authedTrue";
  });
  const [inputPassword, setInputPassword] = React.useState("");

  if (!authed) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputPassword === PASSWORD) {
        setAuthed(true);
        localStorage.setItem("authed", "authedTrue");
      } else {
        toast.error("Неверный пароль");
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Toaster position="top-center" reverseOrder={false} />
        <form
          onSubmit={handleLogin}
          className="p-6 bg-white rounded-2xl shadow-md w-full max-w-sm"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Введите пароль</h2>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            placeholder="Пароль"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};
