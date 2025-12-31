import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			const res = await apiFetch("/login", {
				method: "POST",
				body: JSON.stringify({ username, password }),
			});

			// backend returns token here
			localStorage.setItem("token", res.token);

			// successful login → go to home/posts
			navigate("/");
		} catch (err) {
			setError(err.error || "Invalid username or password");
		}
	};

	return (
		<div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
			<div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8">

				<h1 className="text-3xl font-bold text-white">
					Welcome back
				</h1>

				<p className="mt-2 text-slate-400">
					Log in to continue.
				</p>

				{error && (
					<p className="mt-4 text-sm text-red-500">
						{error}
					</p>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">

					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						className="w-full rounded-lg bg-slate-800 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full rounded-lg bg-slate-800 border border-white/10 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
					/>

					<button
						type="submit"
						className="w-full rounded-lg bg-indigo-500 py-3 font-medium text-white hover:bg-indigo-600 transition"
					>
						Log in
					</button>
				</form>

				<p className="mt-6 text-sm text-slate-400">
					Don’t have an account?{" "}
					<Link
						to="/signup"
						className="text-indigo-400 hover:text-indigo-300"
					>
						Sign up
					</Link>
				</p>

			</div>
		</div>
	);
}
