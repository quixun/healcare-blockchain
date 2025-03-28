import { BrowserRouter, Route, Routes } from "react-router";
import Home from "../components/home";
import Login from "../components/login";
import PrivateRoute from "./PrivateRoute";
import Header from "../layouts/header/Header";
import Transfer from "../components/transfer/Transfer";
import Transactions from "../components/transactions";
import ImageUploadPage from "../components/transfer/transfer-image";
import PublicCIDList from "../components/List/image-list";

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
            <Route path="image-list" element={<PublicCIDList />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
