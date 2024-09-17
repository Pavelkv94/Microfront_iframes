import { useRef, useCallback } from "react";

// Define the type for actions
interface Action {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any; // Adjust this based on your action payload structure
}

// Define the MFBus class (message bus for communication with the host)
class MFBus {
  private subscribers: { [key: string]: ((action: Action) => void)[] } = {};

  constructor(private hostOrigin: string) {
    // Set up the message listener
    window.addEventListener("message", this.messageHandler.bind(this));
  }

  // Message handler for incoming messages
  private messageHandler(event: MessageEvent) {
    try {
      const action: Action = JSON.parse(event.data);
      if (this.subscribers[action.type]) {
        this.subscribers[action.type].forEach((subscriber) => {
          subscriber(action);
        });
      }
    } catch (error) {
      console.error("Failed to parse message data:", error);
    }
  }

  // Register the iframe in the host
  registerMeInHost() {
    const action: Action = {
      type: "IFRAME-LOADED",
    };
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  // Send an action to the parent window
  sendToHost(action: Action) {
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  // Subscribe to a specific action type
  subscribe(actionType: string, callback: (action: Action) => void) {
    if (!this.subscribers[actionType]) {
      this.subscribers[actionType] = [];
    }
    this.subscribers[actionType].push(callback);

    // Return a function to unsubscribe
    return () => {
      this.subscribers[actionType] = this.subscribers[actionType].filter((s) => s !== callback);
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

  // Define the methods to return
  const registerMeInHost = useCallback(() => {
    busRef.current?.registerMeInHost();
  }, []);

  const sendToHost = useCallback((action: Action) => {
    busRef.current?.sendToHost(action);
  }, []);

  const subscribe = useCallback((actionType: string, callback: (action: Action) => void) => {
    return busRef.current?.subscribe(actionType, callback) ?? (() => {});
  }, []);

  // Return an object containing the bus methods
  return {
    registerMeInHost,
    sendToHost,
    subscribe,
  };
}
