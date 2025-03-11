import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="justify-self-center">
          <Image
          src={'/sepai-icon.jpg'}
          width={300}
          height={300}
          alt="SepAI Studio Logo"
          />
        </div>
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Welcome to SepAI Studio
        </h1>
        <p className="text-gray-700 text-lg text-center mb-6">
          Let&apos;s Go To The Studio
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard">

            <button className="bg-black text-white py-2 px-6 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Get Started
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}
