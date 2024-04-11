export const roles = ['admin', 'user', 'carrier'];

export const routes = [
    {
        path: '/admin',
        name: 'Admin',
        roles: ['admin'],
    },
    {
        path: '/user',
        name: 'User',
        roles: ['user'],
    },
    {
        path: '/carrier',
        name: 'Carrier',
        roles: ['carrier'],
    },
];