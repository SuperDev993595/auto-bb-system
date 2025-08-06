import { createContext, useContext } from "react";

export const AuthContext = createContext({
    role: localStorage.getItem("role") || "",
    email: localStorage.getItem("email") || "",
});

export const useAuth = () => useContext(AuthContext);
