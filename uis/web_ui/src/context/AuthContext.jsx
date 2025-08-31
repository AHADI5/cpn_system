import { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
                setPermissions(decoded.permissions || []);
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
        setLoading(false);
    }, []);

    // Function to log in the user and set the token
    // This function should be called after a successful login
    const login = (token) => {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        setUser(decoded);
        setPermissions(decoded.permissions || []);
        setLoading(false);
    };

    // Function to extract informations  , Role, 
    const storedToken  = localStorage.getItem("token")

      const decoded = jwtDecode(storedToken); 
      console.log("Decoded token" , decoded);
      const userRole = decoded.authorities;
      const userEmail = decoded.sub;


    // Function to log out the user and clear the token
    // This function should be called when the user logs out
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, permissions, loading, userRole, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );


}
export const useAuth = () => {
    return useContext(AuthContext);
};