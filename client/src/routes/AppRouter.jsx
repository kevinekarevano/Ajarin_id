import HomePage from "@/pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
