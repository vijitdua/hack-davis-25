import { useEffect, useState } from "react";
import axios from "axios";
import { env } from "@/configs/env";

export default function AuthGuard({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await axios.get(`${env.backendUrl}/api/me`, {
                    withCredentials: true,
                });

                if (!res.data.loggedIn) {
                    window.location.href = `${env.backendUrl}/login`;
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                window.location.href = `${env.backendUrl}/login`;
            }
        }

        checkAuth();
    }, []);

    if (loading) return null;

    return <>{children}</>;
}
