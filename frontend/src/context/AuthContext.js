import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  loading: null,
  token: null,
  login: () => {},
  logout: () => {},
});
