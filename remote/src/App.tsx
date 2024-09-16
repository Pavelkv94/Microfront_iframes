import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState();

  //реагируем на события извне
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const action = JSON.parse(event.data);

      switch (action.type) {
        case "TOKEN_CREATED":
          setToken(action.payload.token);

          break;

        default:
          break;
      }
    });
  }, []);

  //отправка данных в родителя
  useEffect(() => {
    const action = {
      type: "MENU_SENT",
      payload: { menu: ["Annd", "123123", "asd"] },
    };

    window.parent.postMessage(JSON.stringify(action), "*", []);
  }, []);

  return (
    <>
      <h1>REMOTE APP</h1>
      <p>token is {token}</p>
    </>
  );
}

export default App;
