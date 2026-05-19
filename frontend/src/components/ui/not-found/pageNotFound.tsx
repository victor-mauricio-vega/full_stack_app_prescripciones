import Link from "next/link";

export const PageNotFound = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row h-[200] w-full justify-center items-center align-middle">
      <div className="text-center mx-5 px-5">
        <h2 className="text-9xl">404</h2>
        <p className="text-xl">oo0ps! lo sentimos mucho</p>
        <Link className="rounded-2xl hover:bg-gray-200 " href="/">
          Inicio
        </Link>
      </div>
    </div>
  );
};
