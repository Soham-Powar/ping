import { useNavigate } from "react-router-dom";

export default function ChatError({
	title = "Something went wrong",
	message = "This chat cannot be opened.",
}) {
	const navigate = useNavigate();

	return (
		<div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
			<h1 className="text-xl font-semibold">{title}</h1>
			<p className="text-slate-400 text-sm text-center">
				{message}
			</p>

			<button
				onClick={() => navigate("/")}
				className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
			>
				Back to Inbox
			</button>
		</div>
	);
}
