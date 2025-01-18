export const authRoles = {
  ANONYMOUS: "anonymous",
  USER: "user",
  ADMIN: "admin",
};

export const rolePrecedence = {
  [authRoles.ANONYMOUS]: 0,
  [authRoles.USER]: 1,
  [authRoles.ADMIN]: 2,
};