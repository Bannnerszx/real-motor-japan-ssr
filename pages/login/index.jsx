import { useState } from "react";
import dynamic from "next/dynamic";
import HomeHeader from "../../headerComponents/HomeHeader";
const LoginForm = dynamic(() => import("../../loginComponents/LoginForm"), { ssr: false });
export default function Login() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh", // Full screen height
            width: "100vw", // Full screen width
            position: "relative"
        }}>
            <HomeHeader />

            <div style={{
                flex: 3,
                display: "flex",
                justifyContent: "center",
                width: "100%",
                height: "100%"
            }}>
                <LoginForm />
            </div>
        </div>

    )
}