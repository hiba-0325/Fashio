import { useContext, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../util/axiosInstance";
import { toast } from "react-toastify";
import axiosErrorManager from "../util/axiosErrorManage";
import { userData } from "../context/UserContext";

function StripeSuccess() {
  const { sessionID } = useParams();
  const { setCart } = useContext(userData);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionID) {
      toast.error("Session ID is missing.");
      navigate("/");
      return;
    }
    const success = async () => {
      try {
        const { data } = await axiosInstance.patch(
          `/user/order/stripe/success/${sessionID}`
        );
        setCart([]);
        window.location.reload();
        navigate("/orders");
        toast.success(data.message);
      } catch (err) {
        toast.error(axiosErrorManager(err));
      }
    };
    success();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionID]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-green-600">Payment Successful!</h1>
      <p className="mt-4 text-lg text-gray-700">
        Thank you for your order. Your payment has been successfully processed.
      </p>
      <Link
        to="/orders"
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
      >
        View Your Orders
      </Link>
    </div>
  );
}

export default StripeSuccess;
