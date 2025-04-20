import Image from "next/image";

export default function Banner() {
  return (
    <div className="relative w-full h-[300px]">
      <Image
        src="https://thumbs.dreamstime.com/b/anime-banner-illustration-japanese-metropolis-boy-rooftop-looking-over-city-sunset-ai-generated-banner-320600490.jpg"
        alt="Banner"
        className="w-full h-full object-cover object-center"
        fill
      />
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <h1 className="text-4xl font-bold">Welcome to Doctruyen</h1>
      </div>
    </div>
  );
}