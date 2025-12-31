import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
	const navigate = useNavigate();
	const isLoggedIn = Boolean(localStorage.getItem("token"));

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur border-b border-white/10">
			<div className="mx-auto px-6 h-16 flex items-center justify-between">

				<Link
					to="/"
					className="text-xl font-bold tracking-tight text-white"
				>
					Glyph
				</Link>

				<div className="flex items-center gap-6 text-sm">
					{isLoggedIn ? (
						<button
							onClick={handleLogout}
							className="text-slate-300 hover:text-red-400 transition"
						>
							Log out
						</button>
					) : (
						<>
							<Link
								to="/login"
								className="text-slate-300 hover:text-white"
							>
								Log in
							</Link>

							<Link
								to="/signup"
								className="rounded-md bg-indigo-500 px-3 py-1.5 font-medium text-white hover:bg-indigo-600 transition"
							>
								Sign up
							</Link>
						</>
					)}

				</div>
			</div>
		</nav>
	);
}
