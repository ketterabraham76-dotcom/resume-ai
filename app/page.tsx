import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4">
          🚀 AI Resume Builder
        </h1>

        <p className="text-gray-600 mb-6">
          Create professional, ATS-friendly resumes in seconds using AI.
        </p>

        <Link
          href="/resume"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Create Resume
        </Link>
      </div>
    </main>
  );
}