import dotenv from 'dotenv';
dotenv.config();
const loadPermissions = () => {
    const rawPermissions = process.env.PERMISSIONS || '';
    return rawPermissions.split(",").reduce((acc, item) => {
        const [key, value] = item.split(":");
        acc[key] = Number(value);
        return acc; //    If you don’t return acc, TypeScript thinks the return type is void, which doesn’t match Record<string, number>.
    }, {});
};
export const permissionsMap = loadPermissions();
export const validatePermissions = (codes) => {
    const validCodes = Object.values(permissionsMap);
    return codes.every(code => validCodes.includes(code));
};
// Convert numeric code back to key
export const getPermissionKey = (code) => {
    return Object.keys(permissionsMap).find(key => permissionsMap[key] === code);
};
// config/permissions.ts
// export const loadPermissions = () => {
//   const rawPermissions = process.env.PERMISSIONS || '';
//   return rawPermissions.split(',').reduce((acc, item) => {
//     const [key, value] = item.split(':');
//     acc[key] = Number(value);
//     return acc;
//   }, {} as Record<string, number>);
// };
// export const permissionsMap = loadPermissions();
// Example output:
// {
//   user_management: 1,
//   task_management: 2,
//   role_management: 3,
//   all: 999
// }
//# sourceMappingURL=permissions.js.map