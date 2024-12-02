import { Footer } from "./_components/Footer";
import Heading from "./_components/Heading";
import Image from "next/image";

export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-[#1F1F1F] relative overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 ">
        <div className="flex justify-between items-center h-full w-full mx-auto max-w-7xl">
          <div className="relative w-[200px] h-[250px] sm:w-[300px] sm:h-[350px] md:w-[350px] opacity-30 sm:opacity-50 md:opacity-100 transform -translate-x-[5%] sm:-translate-x-[15%]">
            <Image
              className="object-contain mt-10 sm:mt-20"
              src="/documents.png"
              alt="Documents"
              fill
              priority
            />
          </div>
          <div className="relative w-[200px] h-[250px] sm:w-[300px] sm:h-[350px] md:w-[350px] hidden sm:block opacity-30 sm:opacity-50 md:opacity-100">
            <Image
              className="object-contain"
              src="/reading.png"
              alt="Reading"
              fill
              priority
            />
          </div>
          <div className="relative w-[200px] h-[250px] sm:w-[300px] sm:h-[350px] md:w-[350px] hidden md:block opacity-50 lg:opacity-100 transform translate-x-[5%] sm:translate-x-[15%]">
            <Image
              className="object-cover mt-24 sm:mt-32"
              src="/success.png"
              alt="Success"
              fill
              priority
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center gap-y-8 flex-1 px-6 pb-10 pt-32 sm:pt-40 md:pt-64 z-10">
        <Heading />
      </div>
      <Footer />
    </div>
  );
}
