import ChatLayout from "../pages/ChatLayout";
import ChatPage from "../pages/ChatPage";
import ChatPlaceholder from "../components/ChatPlaceholder";

const authenticatedRoutes = [
	{
		path: "/",
		element: <ChatLayout />,
		children: [
			{
				index: true,
				element: <ChatPlaceholder />, // RHS empty state
			},
			{
				path: "chat/:id",
				element: <ChatPage />, // RHS chat view
			},
		],
	},
];

export default authenticatedRoutes;
