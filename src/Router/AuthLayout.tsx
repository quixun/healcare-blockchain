import { Routes, Route } from "react-router-dom";
import Header from "../layouts/header/Header";
import Footer from "../layouts/footer/Footer";
import { privateRoutes } from "./routes";

const AuthLayout = () => (
  <>
    <Header />
    <div className="flex-grow">
      <Routes>
        {privateRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Routes>
    </div>
    <Footer />
  </>
);

export default AuthLayout; 