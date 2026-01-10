import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthContext } from "./context/AuthContext";

import authenticatedRoutes from "./routes/authenticatedRoutes";
import publicRoutes from "./routes/publicRoutes";

const App = () => {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const storedToken = localStorage.getItem("token");

				if (!storedToken) {
					setLoading(false);
					return;
				}

				setToken(storedToken);

				const res = await fetch("http://localhost:3005/users/me", {
					headers: {
						Authorization: `Bearer ${storedToken}`,
					},
				});

				if (!res.ok) {
					throw new Error("Invalid token");
				}

				const userData = await res.json();
				setUser(userData);
			} catch {
				//token invalid or expired
				localStorage.removeItem("token");
				setToken(null);
				setUser(null);
			} finally {
				setLoading(false);
			}
		}
		initAuth();
	}, []);

	const login = async (jwtToken) => {
		try {
			localStorage.setItem("token", jwtToken);
			setToken(jwtToken);

			const res = await fetch("http://localhost:3005/users/me", {
				headers: {
					Authorization: `Bearer ${jwtToken}`,
				},
			});

			if (!res.ok) {
				throw new Error("Login verification failed");
			}

			const userData = await res.json();
			setUser(userData);
		} catch (err) {
			// rollback to clean state
			localStorage.removeItem("token");
			setToken(null);
			setUser(null);

			// rethrow so caller (login page) can show error
			throw err;
		}
	};


	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
	};

	const router = createBrowserRouter(
		user ? authenticatedRoutes : publicRoutes
	);


	return (
		<AuthContext value={{
			user,
			token,
			loading,
			login,
			logout,
		}}>
			<RouterProvider router={router} />
		</AuthContext>
	);
};

export default App;
