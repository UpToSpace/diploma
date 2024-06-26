export const roles = ['admin', 'user', 'carrier'];

export const navLinks = {
    admin: [
        { to: "/", label: "Главная" },
        { to: "/admin", label: "Панель управления" }
    ],
    user: [
        { to: "/", label: "Главная" },
        { to: "/statistics", label: "Статистика" },
        { to: "/tickets", label: "Мои Билеты" },
        { to: "/favorites", label: "Избранное" },
        { to: "/timetable", label: "Расписание" },
        { to: "/map", label: "Карта" }
    ],
    carrier: [
        { to: "/", label: "Главная" },
        { to: "/transports", label: "Транспорт" },
        { to: "/routes", label: "Рейсы" },
        { to: "/statistics", label: "Статистика" },
    ],
    guest: [
        { to: "/reset", label: "Reset Password" },
        { to: "/register", label: "Register" }
    ]
};