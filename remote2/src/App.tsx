import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState();
  const targetOrigin = "http://localhost:5000"; // Change to your parent window's origin

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
      payload: { menu: ["FRONT", "REACT", "JS"] },
    };

    window.parent.postMessage(JSON.stringify(action), targetOrigin);
  }, []);

  useEffect(() => {
    const action = {
      type: "IFRAME-LOADED",
    };
    window.parent.postMessage(JSON.stringify(action), targetOrigin);
  }, []);

  const onProductDeletedHandler = () => {
    const ipcAction = {
      type: "REDUX-ACTION",
      payload: {
        originalAction: {
          type: "CART-PRODUCT-DELETED",
          payload: { productId: 121 },
        },
        source: "MICROFRONT2",
      },
    };
    window.parent.postMessage(JSON.stringify(ipcAction), "*", []);
  };
  return (
    <>
      <h1>REMOTE APP 2</h1>
      <p>token is {token}</p>
      <button onClick={onProductDeletedHandler}>hello to first microfrontend</button>
    </>
  );
}

export default App;
