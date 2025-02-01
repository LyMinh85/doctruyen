import Background from "@/components/Background";
import SignUpForm from "@/components/SignUpForm";
// import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-100">
      <Background />
      <div className="z-10 w-full max-w-md md:max-w-full md:w-fit rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row md:space-x-8 overflow-hidden">
        {/* <Image
          src="https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          // src="https://res.cloudinary.com/du163r961/image/upload/v1671687918/doctruyen8565/20db084c-fc76-4ba0-8809-7e48020b184f_wk2w6l.jpg"
          alt="login"
          width={1260}
          height={750}
          sizes="(max-width: 1260px) 100vw, 1260px"
          className="hidden md:block rounded-l-2xl w-full max-w-lg object-cover"
        /> */}
        <div className="md:w-96 lg:w-[30rem] p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Đăng ký</h1>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
