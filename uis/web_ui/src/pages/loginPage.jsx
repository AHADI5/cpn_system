import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo/logo_v4.png";
import colors from "../utils/colors";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/v1";

async function doLogin({ username, password }) {
  const paths = ["/auth/", "/auth"]; // try with and without trailing slash
  let lastErr;
  for (const path of paths) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain, application/json",
        },
        // Backend expects exact keys: userName, passWord
        body: JSON.stringify({ userName: username, passWord: password }),
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        if (res.status === 404) continue; // try next path
        let msg = text || res.statusText;
        try {
          const errJson = text ? JSON.parse(text) : {};
          msg = errJson.message || msg;
        } catch {
          // Intentionally ignored: not JSON, treat as plain token string
        }
        throw new Error(msg);
      }

      // If backend ever returns JSON: {"token":"..."}
      try {
        const json = text ? JSON.parse(text) : null;
        const token = json?.token || json?.accessToken || json?.jwt || json?.data?.token;
        if (token) return token;
      } catch {
        // Not JSON; treat as plain token string
      }

      const token = (text || "").trim().replace(/^"|"$/g, "");
      if (!token) throw new Error("No token returned by server");
      return token;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Authentication endpoint not found");
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const username = form.get("username");
    const password = form.get("password");

    try {
      const token = await doLogin({ username, password });
      login(token);
      navigate("/dossiers", { replace: true });
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="shadow-md rounded-lg w-full max-w-sm">
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
              <img src={Logo} alt="Logo" className="w-24 mx-auto mb-2" />
              Sign in
            </Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField name="username" label="Username" fullWidth required />
                <TextField name="password" label="Password" type="password" fullWidth required />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1,
                    backgroundColor: colors?.primary || undefined,
                    "&:hover": { backgroundColor: colors?.primary || undefined },
                    py: 1.2,
                    fontWeight: 700,
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Login"}
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" align="center" color="text.secondary">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-500">
                Register
              </a>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}