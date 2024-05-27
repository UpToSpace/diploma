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
        <header className="sticky top-0 z-50 grid grid-cols-3 bg-primary shadow-md md:px-10 ">
 
            {/* Left - logo */}
            <div
                onClick={() => navigate("/")}
                className="relative flex item-center cursor-pointer my-auto">
                <div className="relative h-[20px] w-[20px]">
                    <p className='text-white'>ONTEN</p>
                </div>
            </div>

           

            {/* right */}
            <div className="flex items-center space-x-4 justify-start px-2">
                {links.map(link => (
                    <div className={`flex items-center h-full text-center py-6 ${isActive(link.to) && 'border-b-white border-b-2'}`} key={link.to}>
                        <Link
                            
                            to={link.to}
                            className={`font-light text-white hover:text-gray-300 whitespace-nowrap`}
                        >
                            {link.label}
                        </Link>
                    </div>
                ))}
            </div>

            {/* Right - Auth */}
            <div className="flex items-center justify-end space-x-4">
                <div className={`flex items-center h-full text-center py-6 ${isActive('/account') && 'border-b-white border-b-2'}`}>
                    <Link
                        to={'/account'}
                        className={`font-light text-white hover:text-gray-300 flex`}
                    >
                        <img width="30" height="30" src="https://img.icons8.com/dotty/80/ffffff/gender-neutral-user.png" alt="gender-neutral-user" />
                        <div className='items-center'>Аккаунт</div>
                    </Link>
                </div>
            </div>
        </header>
    );
}