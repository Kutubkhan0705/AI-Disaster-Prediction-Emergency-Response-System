import { useEffect } from "react";
import { socket } from "../services/socket.js";

// Subscribe to a socket.io event for the lifetime of the component
export const useSocketEvent = (eventName, handler) => {
  useEffect(() => {
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }, [eventName, handler]);
};
