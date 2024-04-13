export const roles = ['admin', 'user', 'carrier'];

export const navLinks = {
    admin: [
        { to: "/", label: "Home" },
        { to: "/account", label: "Account" },
        { to: "/admin", label: "Admin Panel" }
    ],
    user: [
        { to: "/", label: "Home" },
        { to: "/account", label: "Account" },
        { to: "/search", label: "Search" },
        { to: "/tickets", label: "My Tickets" }
    ],
    carrier: [
        { to: "/", label: "Home" },
        { to: "/account", label: "Account" },
        { to: "/transports", label: "Transports" },
        { to: "/routes", label: "Routes" }
    ],
    guest: [
        { to: "/reset", label: "Reset Password" },
        { to: "/register", label: "Register" }
    ]
};