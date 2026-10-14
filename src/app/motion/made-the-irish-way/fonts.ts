import { Archivo, Fraunces } from "next/font/google";

// Free stand-ins for Gelica and Test Founders Grotesk, which are licensed.
export const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });
export const grotesk = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-grotesk" });
