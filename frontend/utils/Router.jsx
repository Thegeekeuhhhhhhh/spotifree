export const Route = ({ path, children, currentPath }) => {
  return currentPath === path ? children : null;
};