import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import ScrollToTop from "../components/common/force-top";
import AuthLayout from "./AuthLayout";
import { publicRoutes } from "./routes";
import ChatPage from "@/components/chat/AiChatPage";

export default function Router() {
  return (
    <BrowserRouter>
      <ChatPage />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Routes>
          {publicRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<AuthLayout />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
