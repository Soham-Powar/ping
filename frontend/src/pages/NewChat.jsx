import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

export default function NewChat() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await apiFetch("/users");
				setUsers(data.users);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const filteredUsers = users.filter((u) =>
		u.username.toLowerCase().includes(search.toLowerCase())
	);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center text-slate-400">
				Loading users...
			</div>
		);
	}

	return (
		<div className="h-screen bg-gray-900 text-white flex flex-col">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-gray-900 border-b border-slate-700">
				<div className="flex items-center gap-3 p-4">
					<button
						onClick={() => navigate(-1)}
						className="text-slate-400 hover:text-white"
					>
						←
					</button>
					<h1 className="text-lg font-semibold">New Chat</h1>
				</div>

				{/* Search */}
				<div className="px-4 pb-3">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search users..."
						className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
					/>
				</div>
			</div>

			{/* User list */}
			<div className="flex-1 overflow-y-auto">
				{filteredUsers.length === 0 && (
					<div className="p-6 text-center text-slate-400">
						No users found
					</div>
				)}

				{filteredUsers.map((user) => (
					<div
						key={user.id}
						onClick={() => navigate(`/chat/${user.id}`)}
						className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-800 transition"
					>
						<img
							src={user.avatar_url || "/default_avatar.png"}
							alt={user.username}
							className="w-11 h-11 rounded-full object-cover shrink-0"
						/>

						<div className="min-w-0">
							<div className="font-medium truncate">
								{user.username}
							</div>
							<div className="text-xs text-slate-400">
								Tap to start chat
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
