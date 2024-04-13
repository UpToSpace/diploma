import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../hooks/auth.hook";// Assuming you have an AuthContext
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { useNavigate } from 'react-router-dom';
import logo from "../styles/images/logo.png";
import { navLinks } from '../constants/constants';

export default function Header() {
    const { userRole } = useAuth(); // Assuming useAuth provides the current user role
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;
    const links = navLinks[userRole] || navLinks.guest;
    return (
        <header className="sticky top-0 z-50 grid grid-cols-3 bg-white shadow-md p-5
    md:px-10 ">
 
            {/* Left - logo */}
            <div
                onClick={() => navigate("/")}
                className="relative flex item-center cursor-pointer my-auto">
                <div class="relative h-[20px] w-[20px]">
                    {/* <img src={logo} class="custom-img" /> */}
                    <p>LOGO</p>
                </div>
            </div>

           

            {/* right */}
            <div className="flex items-center space-x-4 justify-start bg-white px-6">
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`hover:text-gray-700 ${isActive(link.to) ? 'text-gray-800' : 'text-gray-500'}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </header>
    );
}