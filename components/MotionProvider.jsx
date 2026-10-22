"use client";
import { MotionConfig } from "framer-motion";

// Skips transform animations for people who prefer reduced motion,
// without rendering differently on the server and client
export default function MotionProvider({ children }) {
	return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
