import { Footer } from './Footer';
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <Header />
            <div className="flex flex-col min-h-screen mx-auto">
                <Outlet />
            </div>
            <Footer />
        </>
    );
}