import Hero from "../Components/Hero/Hero";
import menAd from "../Components/assets/menAd.jpg";
import womenAd from "../Components/assets/womenAd.jpg";
import Card from "../Components/Shared/Card";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { userData } from "../context/UserContext";
import axiosInstance from "../util/axiosInstance";
import axiosErrorManager from "../util/axiosErrorManage";
import { toast } from "react-toastify";
import Loading from "../Components/Loading/Loading";

function Shop() {
  const [products, setProducts] = useState([]);
  const { currUser, loading,setLoading } = useContext(userData);
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/user/product");
        setProducts(data.data);
      } catch (err) {
        toast.error(axiosErrorManager(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [currUser, setLoading]);

  if(loading){
    return <Loading/>
  }
   
  return (
    <div>
      <Hero />
     
      <div className="flex items-center justify-center flex-wrap">
        {products.map((item) => {
          return (
            <Card
              key={item._id}
              id={item._id}
              image={item.image}
              price={item.price}
              type={item.type}
              name={item.name}
              rating={item.rating}
            />
          );
        })}
      </div>

      <div className="menAd flex flex-wrap justify-center gap-8 items-center py-10 bg-[#F5F0CD]">
  {/* Men's Section */}
  <div className=" bg-transparent p-4 rounded-lg  transition-transform transform hover:scale-105">
  <NavLink to="/men">
    <img
      src={menAd}
      className="w-[280px] h-[280px] rounded-full object-cover"
      alt="Men's Ad"
    />
   
     
    </NavLink>
  </div>

  {/* Women's Section */}
  <div className=" bg-transparent p-4 rounded-lg  transition-transform transform hover:scale-105">
   
  <NavLink to="/women"> <img
      src={womenAd}
      className="w-[280px] h-[280px] rounded-full object-cover"
      alt="Women's Ad"
    />
   
     
    </NavLink>
  </div>
</div>

    </div>
  );
}

export default Shop;
