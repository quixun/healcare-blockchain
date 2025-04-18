import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../components/home";
import Login from "../components/login";
import PrivateRoute from "./PrivateRoute";
import Header from "../layouts/header/Header";
import Transfer from "../components/transfer/Transfer";
import Transactions from "../components/transactions";
import UploadInfoForm from "../components/List/MedicalRecordUpload";
import ChatPage from "../components/chat/AiChatPage";
import RecordOwnershipCheck from "../components/List/MedicalRecordsList";
import AboutUsPage from "../components/about-us-page/about-us-page";
import Footer from "../layouts/footer/Footer";
import AccountPage from "../components/account/account-page";
import MedicinesList from "../components/medicines/medicines-list";
import ScrollToTop from "../components/common/force-top";

const AuthLayout = () => (
  <>
    <Header />
    <div className="flex-grow">
      <Routes>
        <Route index element={<Home />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transfer-image" element={<UploadInfoForm />} />
        <Route path="chat-ai" element={<ChatPage />} />
        <Route path="services/record" element={<RecordOwnershipCheck />} />
        <Route path="about-us" element={<AboutUsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="services/medicines" element={<MedicinesList />} />
      </Routes>
    </div>
    <Footer />
  </>
);

export default function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<AuthLayout />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
