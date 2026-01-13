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
		const fetchInbox = async () => {
			try {
				setLoading(true);

				const [dmData, groupData] = await Promise.all([
					apiFetch("/messages/inbox"),
					apiFetch("/groups"),
				]);

				const directChats = dmData.inbox.map((chat) => ({
					type: "DIRECT",
					id: chat.user.id,
					title: chat.user.username,
					avatar_url: chat.user.avatar_url,
					lastMessage: chat.content,
					unreadCount: chat.unreadCount,
					isSentByMe: chat.isSentByMe,
				}));

				const groupChats = groupData.map((group) => ({
					type: "GROUP",
					id: group.id,
					title: group.name,
					avatar_url: group.avatar_url,
					lastMessage: group.lastMessage?.content || "",
					unreadCount: group.unreadCount,
				}));

				// optional: sort by last message time later
				setChats([...groupChats, ...directChats]);
			} catch (err) {
				setError(`Failed to load inbox ${err}`);
			} finally {
				setLoading(false);
			}
		};

		fetchInbox();
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
				{chats.map((item) => (
					<NavLink
						key={`${item.type}-${item.id}`}
						to={
							item.type === "GROUP"
								? `/groups/${item.id}`
								: `/chat/${item.id}`
						}
						className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800"
					>
						<img
							src={item.avatar_url || "/default_avatar.png"}
							className="w-10 h-10 rounded-full"
						/>

						<div className="flex-1 min-w-0">
							<div className="flex justify-between">
								<span className="font-medium truncate">
									{item.title}
								</span>
								{item.unreadCount > 0 && (
									<span className="text-xs bg-red-500 rounded-full px-2">
										{item.unreadCount}
									</span>
								)}
							</div>

							<div className="text-sm text-slate-400 truncate">
								{item.lastMessage}
							</div>
						</div>
					</NavLink>
				))}

			</div>

		</div>
	);
};

export default InboxSidebar;
