import { ButtonHTMLAttributes } from "react";

export default function ButtonVertical({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`not-disabled:cursor-pointer flex flex-col items-center justify-center bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-500 p-1 px-3 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}