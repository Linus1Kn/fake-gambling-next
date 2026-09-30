import { FormHTMLAttributes } from "react";

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  title?: string;
};

export default function Form({
  title,
  children,
  className = "",
  ...props
}: FormProps) {
  return (
    <form
      className={`flex flex-col gap-2 border border-white p-4 max-w-100 ${className}`}
      {...props}
    >
      {title && <h1>{title}</h1>}

      {title && <div className="w-full h-px bg-white"></div>}

      {children}
    </form>
  );
}