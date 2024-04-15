import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { MainPage } from "./pages/user/MainPage";
import { NotFoundPage } from "./pages/errorpages/NotFoundPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { AccountPage } from "./pages/AccountPage";
import { roles } from "./constants/constants";
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { RegisterPage } from './pages/RegisterPage';
import Layout from './components/Layout';
import { SearchPage } from './pages/user/SearchPage';
import { CarrierMainPage } from './pages/carrier/CarrierMainPage';
import { CarrierTransportsPage } from './pages/carrier/CarrierTransportsPage';
import { CarrierRoutesPage } from './pages/carrier/CarrierRoutesPage';
import { TicketsPage } from './pages/user/TicketsPage';
import { CarrierTransportPage } from './pages/carrier/CarrierTransportPage';
import { TripPage } from './pages/user/TripPage';
import { TicketPage } from './pages/user/TicketPage';

export const useRoutes = (userRole) => {
    switch (userRole) {
        case roles[0]: // admin
            return (
                <Route path="/" element={<Layout />}>
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/admin" exact element={<AdminPage />} />
                    <Route path="/" exact element={<MainPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            );
        case roles[1]: // user
            return (
                <Route path="/" element={<Layout />}>
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/trips/:id" element={<TripPage />} />
                    <Route path="/" exact element={<MainPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/tickets/:id" element={<TicketPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            );
        case roles[2]: // carrier
            return (
                <Route path="/" element={<Layout />}>
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/transports" element={<CarrierTransportsPage />} />
                    <Route path="/transports/:id" element={<CarrierTransportPage />} />
                    <Route path="/routes" exact element={<CarrierRoutesPage />} />
                    <Route path="/" exact element={<CarrierMainPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            );
        default:
            return (
                <>
                    <Route path="/reset" element={<ResetPasswordPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={
                        <AuthPage />
                    } />
                    <Route path="*" element={
                        <AuthPage />
                    } />
                </>
            );
    }
}