import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ChatLayout from "../pages/ChatLayout";
import ChatPlaceholder from "../components/ChatPlaceholder";
import ChatPage from "../pages/ChatPage"

import RequireAuth from "./RequireAuth";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/signup",
		element: <Signup />,
	},
	{
		path: "/",
		element: (
			<RequireAuth>
				<ChatLayout />
			</RequireAuth>
		),
		children: [
			{
				index: true,
				element: <ChatPlaceholder />,
			},
			{
				path: "chat/:id",
				element: <ChatPage />,
			},
		],
	},
]);


export default router;