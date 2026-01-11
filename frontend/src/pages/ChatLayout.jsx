import { Outlet } from "react-router-dom";
import InboxSidebar from "../components/InboxSidebar";

const ChatLayout = () => {
	return (
		<div className="flex h-screen w-screen overflow-hidden">
			{/* LEFT: Inbox (persistent) */}
			<div className="w-[360px] border-r border-gray-700">
				<InboxSidebar />
			</div>

			{/* RIGHT: Chat area (route-driven) */}
			<div className="flex-1 bg-gray-900">
				<Outlet />
			</div>
		</div>
	);
};

export default ChatLayout;
