import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Logo from "../assets/logo/logo_v4.png";
import colors from "../utils/colors";
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
        const token = btoa(`${username}:${password}`);
        login(token);
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center">
            <Card className="shadow-md rounded-lg w-full max-w-sm">
                <CardContent className="space-y-6">
                    <Typography variant="h4" className="text-center font-semibold text-gray-800" sx={{ mb: 6 }}>
                        <img src={Logo} alt="Logo" className="w-24 mx-auto mb-4" />
                    </Typography>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TextField
                            name="username"
                            label="Username"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{ mb: 4 }}
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
                            sx={{
                                mt: 6,
                                backgroundColor: colors.primary,
                                '&:hover': { backgroundColor: colors.primary }
                            }
                            }
                        >
                            {loading ? <CircularProgress size={24} /> : "Login"}
                        </Button>
                        <Typography variant="body2" className="text-center text-gray-600" sx={{ mt: 6 }}>
                            Don't have an account? <a href="/register" className="-blue-500">Register</a>
                        </Typography>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
