import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">
          Welcome to My Website
        </h1>
        <p className="text-gray-700 text-lg text-center mb-6">
          This is a simple Next.js app with TypeScript and Tailwind CSS.
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard">

            <button className="bg-indigo-600 text-white py-2 px-6 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Get Started
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}
