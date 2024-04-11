import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { useAuth } from "../hooks/auth.hook";
import { roles } from "./../constants/constants";
import {
    SearchIcon,
    MenuIcon,
    UserCircleIcon,
    UsersIcon,
    GlobeAltIcon,
} from "@heroicons/react/solid"
import { useState } from "react";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Calendar } from "react-date-range";
import { useNavigate } from 'react-router-dom';
import { ru } from 'date-fns/locale';
import logo from "../styles/images/logo.png";

export default function Header() {
    const navigate = useNavigate();
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
            <div className="flex items-center space-x-4 justify-end text-gray-500">
                
            </div>
        </header>
    );
}