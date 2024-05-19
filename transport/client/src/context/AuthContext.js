import { createContext } from "react";

export const AuthContext = createContext({
    userId: null,
    userRole: null,
    userLocation: null,
    login: () => {},
    logout: () => {}
});