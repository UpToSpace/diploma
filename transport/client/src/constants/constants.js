export const roles = ['admin', 'user', 'carrier'];

export const navLinks = {
    admin: [
        { to: "/", label: "Home" },
        { to: "/account", label: "Account" },
        { to: "/admin", label: "Admin Panel" }
    ],
    user: [
        { to: "/", label: "Главная" },
        { to: "/account", label: "Аккаунт" },
        { to: "/statistics", label: "Статистика" },
        { to: "/tickets", label: "Мои Билеты" },
        { to: "/favorites", label: "Избранное" },
        { to: "/timetable", label: "Расписание" },
        { to: "/map", label: "Карта" }
    ],
    carrier: [
        { to: "/", label: "Home" },
        { to: "/account", label: "Account" },
        { to: "/transports", label: "Transports" },
        { to: "/routes", label: "Routes" },
        { to: "/statistics", label: "Статистика" },
    ],
    guest: [
        { to: "/reset", label: "Reset Password" },
        { to: "/register", label: "Register" }
    ]
};