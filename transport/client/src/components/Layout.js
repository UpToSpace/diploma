import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <Header />
            <div className="px-1 flex flex-col min-h-screen max-w-5xl mx-auto">
                <Outlet />
            </div>
        </>
    );
}