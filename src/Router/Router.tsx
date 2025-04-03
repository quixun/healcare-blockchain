import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../components/home";
import Login from "../components/login";
import PrivateRoute from "./PrivateRoute";
import Header from "../layouts/header/Header";
import Transfer from "../components/transfer/Transfer";
import Transactions from "../components/transactions";
import ImageUploadPage from "../components/transfer/transfer-image";
import ChatPage from "../components/chat/AiChatPage";
import PublicCIDList from "../components/List/MedicalRecordsList";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Header />}>
            <Route index element={<Home />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transfer-image" element={<ImageUploadPage />} />
            <Route path="chat-ai" element={<ChatPage />} />
            <Route path="image-list" element={<PublicCIDList />} />
          </Route>
        </Route>
      </Routes>

      <footer className="fixed bottom-0 left-0 w-full flex justify-center text-xs p-4 bg-white shadow-md">
        © 2025 QXHub. All rights reserved
      </footer>
    </BrowserRouter>
  );
};

export default Router;
