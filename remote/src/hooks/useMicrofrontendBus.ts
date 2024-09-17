/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

// Define the MFBus class (message bus for communication with the host)
class MFBus {
  constructor(private hostOrigin: string) {
    // Set up the message listener
    window.addEventListener("message", (event) => {
      const action = JSON.parse(event.data);
      if (this.subscribers[action.type]) {
        this.subscribers[action.type].forEach((subscriber: any) => {
          subscriber(action);
        });
      }
    });
  }

  subscribers: any = {};

  // Register the iframe in the host
  registerMeInHost() {
    const action = {
      type: "IFRAME-LOADED",
    };
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  // Emit an action to the parent window
  emit(action: any) {
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  // Subscribe to a specific action type
  subscribe(actionType: string, callback: any) {
    if (!this.subscribers[actionType]) {
      this.subscribers[actionType] = [];
    }
    this.subscribers[actionType].push(callback);

    // Return a function to unsubscribe
    return () => {
      this.subscribers[actionType] = this.subscribers[actionType].filter((s: any) => s !== callback);
    };
  }
}

// Create a custom hook for using the bus
export function useMicrofrontendBus(origin: string) {
  const busRef = useRef<MFBus | null>(null);

  // Initialize the bus once when the hook is first used
  if (!busRef.current) {
    busRef.current = new MFBus(origin);
  }

  useEffect(() => {
    // Register the iframe in the host when the component mounts
    busRef.current?.registerMeInHost();
  }, []);

  // Return the bus instance (this could be enhanced to return specific methods only)
  return busRef.current;
}
