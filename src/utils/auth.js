import { rolePrecedence } from "../constants/auth.js";

export const getSortedRoles = ({ roles, higherPrecedence = true }) => {
  let sortedRoles = [...roles];
  return sortedRoles?.sort((a, b) => {
    return higherPrecedence
      ? rolePrecedence[b] - rolePrecedence[a]
      : rolePrecedence[a] - rolePrecedence[b];
  });
};

export const getMostSignificantRole = (roles) => {
  let sortedRoles = getSortedRoles({ roles });
  return sortedRoles[0];
};
