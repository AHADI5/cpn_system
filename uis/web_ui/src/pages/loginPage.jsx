import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";
export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const handleSubmit = (event) => {

        event.preventDefault();
        setLoading(true);
        const username = event.target.username.value;
        const password = event.target.password.value;
        const token = btoa(`${username}:${password}`); // Simulating token generation, replace with actual login logic
        // Call the login function from AuthContext
        login(token);
        setLoading(false);

    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-[90%] max-w-sm">
                <Card className="w-1/2 shadow-md rounded-lg">
                    <CardContent className="space-y-6">
                        <Typography variant="h4" className="text-center font-semibold text-gray-800">
                            Login
                        </Typography>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <TextField
                                name="username"
                                label="Username"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <TextField
                                name="password"
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Login"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>

        </div>

    );
}