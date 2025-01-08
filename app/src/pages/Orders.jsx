import Loading from "../Components/Loading/Loading";
import { SiTicktick } from "react-icons/si";
import { MdOutlinePending } from "react-icons/md";
import { useContext, useEffect, useState } from "react";
import { userData } from "../context/UserContext";
import axiosInstance from "../util/axiosInstance";
import { ProductsData } from "../context/ProductsCont";
import axiosErrorManager from "../util/axiosErrorManage";
import { toast } from "react-toastify";
function Orders() {
  const { currUser, loading } = useContext(userData);
  const { currency } = useContext(ProductsData);
  const [orders, setOrders] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get(
          `user/order?page=${currentPage}&limit=5`
        );
        setOrders(data?.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error(axiosErrorManager(error));
      }
    };
    fetchOrders();
  }, [currentPage]);

  if (loading) {
    return <Loading />;
  }

  if (!currUser || !orders) {
    return <div className="text-center mt-5">Loading user data...</div>;
  }

  const handleCancelOrder = async (orderId) => {
    try {
      const { data } = await axiosInstance.patch(
        `/user/order/cancel/${orderId}`
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.data?._id ? { ...order, ...data?.data } : order
        )
      );
      window.location.reload();
      toast.success(data.message);
    } catch (error) {
      toast.error(axiosErrorManager(error));
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Your Orders</h1>
      {orders.length > 0 ? (
        <>
          {orders.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow-md rounded-lg p-6 mb-4"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Shipping Status: {item.shippingStatus}
                </h2>
              </div>
              {item.paymentStatus === "paid" ? (
                <div className="flex gap-1">
                  <p className="text-green-600 font-semibold">Order is paid</p>
                  <SiTicktick size={15} className="text-green-600 mt-[4px]" />
                </div>
              ) : item.paymentStatus === "Cash on delivery" &&
                item.shippingStatus !== "cancelled" ? (
                <div className="flex gap-1">
                  <p className="text-red-600 font-semibold">Order is unpaid</p>
                  <MdOutlinePending size={22} className="text-red-600 " />
                </div>
              ) : (
                <div className="flex gap-1">
                  <p className="text-red-600 font-semibold">
                    Order is Cancelled
                  </p>
                  <MdOutlinePending size={22} className="text-red-600 " />
                </div>
              )}
              <h2 className="text-xl font-[700]">Order ID: {item._id}</h2>
              <h2>name: {item.firstName + " " + item.lastName}</h2>
              <h2>email: {item.email}</h2>
              <h2>mobile: {item.mobile}</h2>
              <p className="text-gray-600">
                {item.address.city}, {item.address.state}, {item.address.zip}
              </p>
              <h5 className="text-gray-600 text-xl font-medium">
                Total : <span className="text-[black]">{currency}</span>
                <span
                  className={`${
                    item.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.totalAmount}
                </span>
              </h5>
              <button
                onClick={() => handleCancelOrder(item._id)}
                disabled={item.shippingStatus === "cancelled"}
                className={`mt-5 px-4 py-2 rounded ${
                  item.shippingStatus === "cancelled"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-800 text-white"
                }`}
              >
                {item.shippingStatus === "cancelled"
                  ? "Cancelled"
                  : "Cancel Order"}
              </button>
              {item.products && item.products.length > 0 && (
                <div className="w-full ">
                  {item.products.map((i, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg flex gap-52 w-full"
                    >
                      <div>
                        <h4 className="font-semibold">{i.productId.name}</h4>
                        <p>Quantity: {i.quantity}</p>
                        <p>Price: ${i.productId.price}</p>
                      </div>
                      <div>
                        <p>
                          <img
                            src={i.productId.image}
                            width={140}
                            alt="image of product"
                          />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-4 text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">No orders found.</div>
      )}
    </div>
  );
}

export default Orders;
