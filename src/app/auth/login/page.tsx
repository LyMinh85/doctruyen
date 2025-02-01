import Background from "@/components/Background";
import LoginForm from "@/components/LoginForm";
// import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-100">
      <Background />
      <div className="z-10 w-full max-w-md md:max-w-full md:w-fit rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row md:space-x-8">
        {/* <Image
          src="https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="login"
          width={1260}
          height={750}
          sizes="(max-width: 1260px) 100vw, 1260px"
          className="hidden md:block rounded-l-2xl w-full max-w-lg object-cover"
        /> */}
        <div className="md:w-96 lg:w-[30rem] p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Đăng nhập</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
