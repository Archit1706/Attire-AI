// "use client";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs/app-beta";
import type { Metadata } from "next";
import React from "react";
import { Ubuntu } from "next/font/google";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ubuntu = Ubuntu({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: "normal",
});

export const metadata: Metadata = {
    title: "AttireAI - Conversational Fashion Outfit Generator",
    description:
        "Revolutionizing fashion discovery through Gen AI-powered outfit recommendations.",
    authors: [
        { name: "Siddharth Nachane", url: "https://replit.com/@sidd065" },
        { name: "Archit Rathod", url: "http://architrathod.codes/" },
    ],
    applicationName: "AttireAI",
    keywords:
        "fashion outfit generator, Gen AI, personalized fashion, trends, outfit recommendations",
    openGraph: {
        title: "AttireAI - Conversational Fashion Outfit Generator",
        description:
            "Revolutionizing fashion discovery through Gen AI-powered outfit recommendations.",
        type: "website",
        url: "https://attire-ai.vercel.app/",
        images: "https://attire-ai.vercel.app/logo2.png/",
        siteName: "AttireAI",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${ubuntu.className} min-h-screen bg-gradient-to-bl to-[#F8E831] from-[#047BD5] overflow-x-hidden`}
                >
                    <div className="h-full min-h-screen w-full bg-white/50">
                        <ToastContainer
                            position="bottom-center"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                        <Navbar />
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
