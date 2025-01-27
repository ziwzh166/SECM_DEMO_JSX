import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="header h-screen flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-5">
        <NavLink to="/" className="rounded-lg bg-white items-center justify-center flex font-bold shadow-md p-2">
          <p className="blue-gradient_text">
            SECM
          </p>
        </NavLink>
      </div>
      {isHomePage && (
  <nav className="flex flex-col items-start justify-center text-lg gap-7 font-medium p-5 absolute bottom-0 left-0">
    <NavLink to="/Images" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-black-500'}>
      <p className="text-gray-800 text-1xl font-bold text-center bg-gray-100 p-5 rounded-lg shadow-md bg-opacity-60 text-opacity-30 hover:bg-opacity-100 hover:text-opacity-100 transition duration-300">
        What is an Image?
      </p>
    </NavLink>
    <NavLink to="/Catalysis" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-black-500'}>
      <p className="text-gray-800 text-1xl font-bold text-center bg-gray-100 p-5 rounded-lg shadow-md bg-opacity-60 text-opacity-30 hover:bg-opacity-100 hover:text-opacity-100 transition duration-300">
        Understanding Catalysis
      </p>
    </NavLink>
    <NavLink to="/echem" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-black-500'}>
      <p className="text-gray-800 text-1xl font-bold text-center bg-gray-100 p-5 rounded-lg shadow-md bg-opacity-60 text-opacity-30 hover:bg-opacity-100 hover:text-opacity-100 transition duration-300">
        Electrochemical Sensors and Detection
      </p>
    </NavLink>
    <NavLink to="/SECM_Image" className={({ isActive }) => isActive ? 'text-blue-500' : 'text-black-500'}>
      <p className="text-gray-800 text-1xl font-bold text-center bg-gray-100 p-5 rounded-lg shadow-md bg-opacity-60 text-opacity-30 hover:bg-opacity-100 hover:text-opacity-100 transition duration-300">
        Bringing It All Together: SECM Imaging
      </p>
    </NavLink>
  </nav>
)}
    </header>
  );
};

export default Navbar;