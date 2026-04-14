"use client";

import { useEffect } from "react";

export const Link = ({ children, href, ...props }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export const useNavigate = () => {
  return (to, options = {}) => {
    if (typeof window === "undefined") {
      return;
    }

    if (options.replace) {
      window.location.replace(to);
      return;
    }

    window.location.assign(to);
  };
};

export const useLocation = () => ({
  pathname: typeof window === "undefined" ? "/" : window.location.pathname,
});

export const Navigate = ({ to, replace = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
};
