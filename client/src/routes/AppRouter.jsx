import { LandingPage } from "@/pages/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
