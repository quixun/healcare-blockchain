import Home from "../components/home";
import Login from "../components/login";
import Transfer from "../components/transfer/Transfer";
import Transactions from "../components/transactions";
import UploadInfoForm from "../components/List/MedicalRecordUpload";
import RecordOwnershipCheck from "../components/List/MedicalRecordsList";
import AboutUsPage from "../components/about-us-page/about-us-page";
import AccountPage from "../components/account/account-page";
import MedicinesList from "../components/medicines/medicines-list";
import { RecordDetail } from "../components/List/MedicalRecordDetail";
import UploadProduct from "../components/medicines/medicine-products/upload-product/upload-product";
import MyProduct from "@/components/medicines/medicine-products/get-product/my-product";
import BuyProduct from "@/components/medicines/medicine-products/buy-product/buy-product";
import UpdateProduct from "@/components/medicines/medicine-products/update-product/update-product";
import ConfirmAppointment from "@/components/appointment/confirm-appointment";
import HistorySharedRecord from "@/components/List/HistorySharedRecord";

export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  TRANSFER: "/transfer",
  TRANSACTIONS: "/transactions",
  HISTORY_SHARED: "/shared-history",
  TRANSFER_IMAGE: "/transfer-image",
  RECORD: "/services/record",
  RECORD_DETAILS: "/services/record/details/:recordID",
  BUY_PRODUCT: "/buy-product/:productID",
  ABOUT_US: "/about-us",
  ACCOUNT: "/account",
  MEDICINES: "/services/medicines",
  CONFIRM_BOOK_APPOINTMENT: "/confirm-book-appointment",
  UPLOAD_PRODUCT: "/upload-product",
  MY_PRODUCTS: "/my-products",
  UPDATE_PRODUCT: "/update-product/:productID",
} as const;

export const publicRoutes = [
  {
    path: ROUTES.LOGIN,
    element: Login,
  },
];

export const privateRoutes = [
  {
    path: ROUTES.HOME,
    element: Home,
  },
  {
    path: ROUTES.TRANSFER,
    element: Transfer,
  },
  {
    path: ROUTES.TRANSACTIONS,
    element: Transactions,
  },
  {
    path: ROUTES.HISTORY_SHARED,
    element: HistorySharedRecord,
  },
  {
    path: ROUTES.TRANSFER_IMAGE,
    element: UploadInfoForm,
  },
  {
    path: ROUTES.RECORD,
    element: RecordOwnershipCheck,
  },
  {
    path: ROUTES.RECORD_DETAILS,
    element: RecordDetail,
  },
  {
    path: ROUTES.BUY_PRODUCT,
    element: BuyProduct,
  },
  {
    path: ROUTES.ABOUT_US,
    element: AboutUsPage,
  },
  {
    path: ROUTES.ACCOUNT,
    element: AccountPage,
  },
  {
    path: ROUTES.MEDICINES,
    element: MedicinesList,
  },
  {
    path: ROUTES.UPLOAD_PRODUCT,
    element: UploadProduct,
  },
  {
    path: ROUTES.MY_PRODUCTS,
    element: MyProduct,
  },
  {
    path: ROUTES.UPDATE_PRODUCT,
    element: UpdateProduct,
  },
  {
    path: ROUTES.CONFIRM_BOOK_APPOINTMENT,
    element: ConfirmAppointment,
  },
];
