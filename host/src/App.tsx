/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./App.css";
import { useHostBus } from "./hooks/useHostBus";

function App() {
  const [menu, setMenu] = useState<string[]>([]);
  const originsWhiteList = ["http://localhost:5001", "http://localhost:5002"];

  const hostBus = useHostBus(originsWhiteList);

  const sendToken = () => {
    const action = {
      type: "TOKEN_CREATED",
      payload: { token: "XXX-YYYY" },
    };

    //отправляем всем подписанным микрофронтам
    hostBus.sendToRemote(action);
  };

  //реагируем на события из ифрейма
  
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (!originsWhiteList.includes(event.origin)) {
        console.warn("Blocked message from untrusted origin:", event.origin);
        return; // Ignore messages from untrusted origins
      }

      try {
        const action: any = JSON.parse(event.data);

        switch (action.type) {
          case "MENU_SENT":
            setMenu((prev) => [...prev, ...action.payload.menu]);
            break;
          default:
            console.warn("Unhandled action type:", action.type);
        }
      } catch (error) {
        console.error("Failed to handle message:", error);
      }
    };

    window.addEventListener("message", messageHandler);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [originsWhiteList]);

  return (
    <div className="App">
      <h1>HOST APP</h1>
      <ul>
        {menu.map((el: string) => (
          <li key={el}>{el}</li>
        ))}
      </ul>
      <button onClick={sendToken}>Send Token to all microfronts</button>
      {/* //todo можем поместить любой сайт без X-Frame-Options */}
      <iframe src={"http://localhost:5001/"} style={{ width: "500px", height: "500px", border: "none", marginRight: "10px" }}></iframe>
      <iframe src={"http://localhost:5002/"} style={{ width: "500px", height: "500px", border: "none" }}></iframe>
    </div>
  );
}

export default App;
