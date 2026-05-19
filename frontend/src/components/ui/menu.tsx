import Link from "next/link";

export const Menu = () => {
  return (
    <nav className="flex px-6 p-2 justify-between items-center w-full ">
      {/* logo */}
      <div>
        <Link href="/">MediPrescribe</Link>
      </div>
      <div className="hidden: sm:block">
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-300"
          href="auth/login"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};
