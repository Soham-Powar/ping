import { useNavigate } from "react-router-dom";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
			<h1 className="text-3xl font-bold">404</h1>
			<p className="text-slate-400">
				The page you’re looking for doesn’t exist.
			</p>

			<button
				onClick={() => navigate("/")}
				className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
			>
				Go to Inbox
			</button>
		</div>
	);
}
