"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function NavLink({
  href,
  children,
  className = "",
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`py-2 px-4 ${className} ${isActive ? "bg-gray-400" : "hover:bg-gray-600"  }`}
    >
      {children}
    </Link>
  );
}