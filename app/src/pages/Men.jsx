import Card from "../Components/Shared/Card";
import Loading from "../Components/Loading/Loading";
import { useContext, useEffect, useState } from "react";
import { userData } from "../context/UserContext";
import axiosErrorManager from "../util/axiosErrorManage";
import axiosInstance from "../util/axiosInstance";

function Men() {
  const [men, setMen] = useState([]);
  const { loading } = useContext(userData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("user/products/category/men");
        setMen(data.data);
      } catch (error) {
        console.error(axiosErrorManager(error));
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="flex w-full  justify-center items-center">
        {loading && <Loading />}
      </div>
      <div className="flex flex-wrap justify-center">
        {men.map((item) => {
          return (
            <Card
              key={item._id}
              id={item._id}
              image={item.image}
              rating={item.rating}
              price={item.price}
              name={item.name}
            />
          );
        })}
      </div>
    </>
  );
}

export default Men;
