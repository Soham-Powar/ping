import Login from "../pages/Login";
import Signup from "../pages/Signup";

const publicRoutes = [
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/signup",
		element: <Signup />,
	},
];

export default publicRoutes;