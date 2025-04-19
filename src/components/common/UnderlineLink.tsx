import Link from "next/link";
import './UnderlineLink.css'; // Import the CSS file for the underline effect

export default function UnderlineLink({
  children,
  href = "#",
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      {...props}
      href={href}
      className={`link-animation ${className}`}
    >
      {children}
      {/* <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 transform scale-x-0 transition-transform duration-200 group-hover:scale-x-100" /> */}
    </Link>
  );
}
