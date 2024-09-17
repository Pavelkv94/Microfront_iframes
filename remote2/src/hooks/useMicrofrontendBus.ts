/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

// Define the MFBus class (message bus for communication with the host)
class MFBus {
  subscribers: any = {};

  constructor(private hostOrigin: string) {
    // Set up the message listener
    window.addEventListener("message", (event) => {
      try {
        const action = JSON.parse(event.data);
        if (this.subscribers[action.type]) {
          this.subscribers[action.type].forEach((subscriber: any) => {
            subscriber(action);
          });
        }
      } catch (error) {
        console.error("Failed to parse message data:", error);
      }
    });
  }

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
  subscribe(actionType: string, callback: (action: any) => void) {
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

  // Return an object containing the bus methods
  return {
    registerMeInHost: () => busRef.current?.registerMeInHost(),
    emit: (action: any) => busRef.current?.emit(action),
    subscribe: (actionType: string, callback: (action: any) => void) => busRef.current?.subscribe(actionType, callback),
  };
}
