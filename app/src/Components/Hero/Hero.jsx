import mainBgAd from "../assets/heroBg-3.jpg";
import { FaArrowRight } from "react-icons/fa";


const Hero = () => {
  
  return (
    <div
      className="relative flex flex-col md:flex-row w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${mainBgAd})` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-0" />
      <div className="flex-1 flex items-center justify-center z-10 p-4">
        <img
          src={mainBgAd}
          alt="Shoe"
          className="w-3/4 md:w-1/2 h-auto rounded-lg shadow-xl"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-start px-6 md:px-8 z-10">
        <h2 className="text-2xl md:text-4xl font-semibold text-white tracking-wider uppercase mb-3 md:mb-5">
          Latest Arrivals
        </h2>
       
        <button className="flex items-center justify-center w-48 md:w-56 h-12 md:h-14 rounded-full bg-gradient-to-r from-[#7cdbfb] to-[#1caee3] text-white text-base md:text-lg font-semibold transition-transform transform hover:scale-110 shadow-xl">
          Check Out <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Hero;
