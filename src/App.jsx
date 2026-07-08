import { BrowserRouter, Routes, Route } from "react-router-dom";

import Join from "./pages/Join";
import Host from "./pages/Host";
import Game1 from "./pages/Game1";
import Game2 from "./pages/Game2";
import Game3 from "./pages/Game3";
import Game4 from "./pages/Game4";
import HostMenu from "./pages/HostMenu";
// ถ้ายังไม่มีไฟล์ Game3/Game4 ให้คอมเมนต์ไว้ก่อน
// import Game3 from "./pages/Game3";
// import Game4 from "./pages/Game4";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
       <Route path="/host" element={<HostMenu />} />

        <Route path="/host/game1" element={<Host />} />
        <Route path="/host/game2" element={<Host />} />
        <Route path="/host/game3" element={<Host />} />
        <Route path="/host/game4" element={<Host />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/game2" element={<Game2 />} />
        <Route path="/game3" element={<Game3 />} />
        <Route path="/game4" element={<Game4 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;