import { NavLink, useNavigate } from "react-router-dom";

import { useEffect, useState, useContext } from "react";
import { apiFetch } from "../api/client";
import { AuthContext } from "../context/AuthContext";

const InboxSidebar = () => {
	const { token } = useContext(AuthContext);

	const navigate = useNavigate();

	const [chats, setChats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchChats = async () => {
			try {
				setLoading(true);
				const data = await apiFetch('/messages/inbox');
				setChats(data.inbox);
			} catch (err) {
				setError(`Failed to load chats: ${err}`);
			} finally {
				setLoading(false);
			}
		}
		fetchChats();
	}, [token]);


	if (loading) {
		return (
			<div className="h-full bg-slate-900 p-4 text-slate-400">
				Loading chats...
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-full bg-slate-900 p-4 text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="h-full bg-slate-900 text-white flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-slate-700 flex justify-between items-center">
				<h2 className="text-lg font-semibold">Inbox</h2>

				<button
					onClick={() => navigate("/new-chat")}
					className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-700"
				>
					New
				</button>
			</div>

			{/* Empty state */}
			{chats.length === 0 && (
				<div className="p-4 text-slate-400">
					No chats yet
				</div>
			)}

			{/* Chat list */}
			<div className="flex-1 overflow-y-auto">
				{chats.map((chat) => (
					<NavLink
						key={chat.user.id}
						to={`/chat/${chat.user.id}`}
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 transition
				${isActive
								? "bg-indigo-600 text-white"
								: "hover:bg-slate-800 text-slate-300"}`
						}
					>
						{/* Avatar */}
						<img
							src={chat.user.avatar_url || "../public/default_avatar.png"}
							alt={chat.user.username}
							className="w-10 h-10 rounded-full object-cover shrink-0"
						/>

						{/* Text */}
						<div className="min-w-0 flex-1">
							<div className="flex justify-between items-center">
								<div className="font-medium truncate">
									{chat.user.username}
								</div>

								{chat.unreadCount > 0 && (
									<span className="ml-2 min-w-[20px] h-[20px] rounded-full bg-red-500 text-xs flex items-center justify-center">
										{chat.unreadCount}
									</span>
								)}
							</div>

							<div className="text-sm text-slate-400 truncate">
								{chat.isSentByMe ? "You: " : ""}
								{chat.content}
							</div>
						</div>
					</NavLink>
				))}
			</div>

		</div>
	);
};

export default InboxSidebar;
