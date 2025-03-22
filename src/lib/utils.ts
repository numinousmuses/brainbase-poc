import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BACKEND_BASE_URL = "https://brainbase-kafka-backend.onrender.com/"


export const WEBSOCKET_BASE_URL = "ws://brainbase-kafka-backend.onrender.com/"