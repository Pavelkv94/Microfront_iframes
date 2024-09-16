import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const microfrontRef = useRef<HTMLIFrameElement>(null);
  const microfront2Ref = useRef<HTMLIFrameElement>(null);

  const [menu, setMenu] = useState<string[]>([]);

  const sendToken = () => {
    const action = {
      type: "TOKEN_CREATED",
      payload: { token: "XXX-YYYY" },
    };
    //отправляем двум микрофронтам
    microfrontRef.current!.contentWindow!.postMessage(JSON.stringify(action), "*");
    microfront2Ref.current!.contentWindow!.postMessage(JSON.stringify(action), "*");
    //если мапим ифреймы то нужно вместо звездочки ставить доверенные адреса
  };

  //реагируем на события из ифрейма
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const action = JSON.parse(event.data);

      switch (action.type) {
        case "MENU_SENT":
          setMenu(prev => [...prev, ...action.payload.menu]);
      }
    });
  }, []);

  return (
    <div className="App">
      <h1>HOST APP</h1>
      <ul>
        {menu.map((el: string) => (
          <li key={el}>{el}</li>
        ))}
      </ul>
      <button onClick={sendToken}>Send Token</button>
      {/* //todo можем поместить любой сайт без X-Frame-Options */}
      <iframe ref={microfrontRef} src={"http://localhost:5001/"} style={{ width: "500px", height: "800px", border: "none" }}></iframe>
      <iframe ref={microfront2Ref} src={"http://localhost:5002/"} style={{ width: "500px", height: "800px", border: "none" }}></iframe>
    </div>
  );
}

export default App;
