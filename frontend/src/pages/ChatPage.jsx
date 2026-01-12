import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api/client";

export default function ChatPage() {
	const { id: otherUserId } = useParams();

	const [messages, setMessages] = useState([]);
	const [otherUser, setOtherUser] = useState(null);
	const [nextCursor, setNextCursor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);

	const bottomRef = useRef(null);
	const containerRef = useRef(null);
	const loadingMoreRef = useRef(false);

	/* ---------------- helpers ---------------- */

	const isSameDay = (d1, d2) =>
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate();

	const formatDayLabel = (date) => {
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		if (isSameDay(date, today)) return "Today";
		if (isSameDay(date, yesterday)) return "Yesterday";

		return date.toLocaleDateString(undefined, {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const formatTime = (iso) =>
		new Date(iso).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	/* ---------------- fetch initial messages ---------------- */

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				setLoading(true);
				const data = await apiFetch(`/messages/${otherUserId}`);

				setMessages(data.messages);
				setNextCursor(data.nextCursor);

				if (data.messages.length > 0) {
					const msg = data.messages[0];
					const user =
						msg.sender.id === Number(otherUserId)
							? msg.sender
							: msg.receiver;
					setOtherUser(user);
				}
			} catch (err) {
				setError(`Failed to load messages: ${err}`);
			} finally {
				setLoading(false);
			}
		};

		fetchMessages();
	}, [otherUserId]);

	/* ---------------- auto scroll to bottom ---------------- */

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	/* ---------------- infinite scroll (older messages) ---------------- */

	const loadOlderMessages = async () => {
		if (!nextCursor || loadingMoreRef.current) return;

		const container = containerRef.current;
		if (!container) return;

		loadingMoreRef.current = true;
		const prevScrollHeight = container.scrollHeight;

		try {
			const data = await apiFetch(
				`/messages/${otherUserId}?cursor=${nextCursor}`
			);

			setMessages((prev) => [...data.messages, ...prev]);
			setNextCursor(data.nextCursor);

			requestAnimationFrame(() => {
				const newScrollHeight = container.scrollHeight;
				container.scrollTop =
					newScrollHeight - prevScrollHeight;
			});
		} finally {
			loadingMoreRef.current = false;
		}
	};

	/* ---------------- send message (optimistic) ---------------- */

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!text.trim() || sending) return;

		const tempId = Date.now();

		const optimisticMsg = {
			id: tempId,
			content: text,
			sender_id: null,
			created_at: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, optimisticMsg]);
		setText("");
		setSending(true);

		try {
			const res = await apiFetch("/messages", {
				method: "POST",
				body: JSON.stringify({
					receiver_id: Number(otherUserId),
					content: optimisticMsg.content,
				}),
			});

			const savedMessage = res.message;

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempId ? savedMessage : msg
				)
			);
		} catch {
			setMessages((prev) =>
				prev.filter((msg) => msg.id !== tempId)
			);
		} finally {
			setSending(false);
		}
	};

	/* ---------------- UI states ---------------- */

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center text-slate-400">
				Loading chat...
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-full flex items-center justify-center text-red-500">
				{error}
			</div>
		);
	}

	/* ---------------- render ---------------- */

	return (
		<div className="h-full flex flex-col bg-gray-900 text-white">
			{/* Header */}
			<div className="h-16 px-4 border-b border-slate-700 flex items-center gap-3">
				{otherUser && (
					<>
						<img
							src={otherUser.avatar_url}
							alt={otherUser.username}
							className="w-10 h-10 rounded-full object-cover"
						/>
						<div className="font-semibold">
							{otherUser.username}
						</div>
					</>
				)}
			</div>

			{/* Messages */}
			<div
				ref={containerRef}
				onScroll={(e) => {
					if (e.target.scrollTop === 0) {
						loadOlderMessages();
					}
				}}
				className="flex-1 overflow-y-auto p-4"
			>
				{messages.map((msg, index) => {
					const msgDate = new Date(msg.created_at);
					const prevMsg = messages[index - 1];
					const prevDate = prevMsg
						? new Date(prevMsg.created_at)
						: null;

					const showDate =
						!prevDate || !isSameDay(msgDate, prevDate);

					const isFromOtherUser =
						msg.sender_id === Number(otherUserId);

					const isSameSenderAsPrev =
						prevMsg && prevMsg.sender_id === msg.sender_id;

					return (
						<div key={msg.id}>
							{showDate && (
								<div className="flex justify-center my-4">
									<span className="px-3 py-1 text-xs text-slate-400 bg-slate-800 rounded-full">
										{formatDayLabel(msgDate)}
									</span>
								</div>
							)}

							<div
								className={`flex ${isFromOtherUser
									? "justify-start"
									: "justify-end"
									} ${isSameSenderAsPrev ? "mt-1" : "mt-3"}`}
							>
								<div
									className={`max-w-[70%] px-4 py-2 text-sm rounded-2xl break-words
										${isFromOtherUser
											? "bg-slate-800 rounded-tl-none"
											: "bg-indigo-600 rounded-tr-none"
										}`}
								>
									{msg.content}
									<div className="mt-1 text-[10px] text-slate-300 text-right">
										{formatTime(msg.created_at)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSendMessage}
				className="p-4 border-t border-slate-700 flex gap-3"
			>
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 rounded-lg bg-slate-800 border border-white/10 p-3 text-white focus:outline-none focus:border-indigo-500"
					disabled={sending}
				/>
				<button
					type="submit"
					disabled={sending || !text.trim()}
					className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
				>
					Send
				</button>
			</form>
		</div>
	);
}
