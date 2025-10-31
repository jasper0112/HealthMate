import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[24px] row-start-2 items-center text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">HealthMate</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Your intelligent health companion: record health data, AI health assessment, intelligent triage, and personalized health plans.
        </p>

        <div className="flex gap-12 items-center flex-col sm:flex-row mt-2">
          <div>
            <Link
              href="/register"
              className="rounded-full border border-solid border-transparent transition-all duration-200 flex items-center justify-center bg-black text-white hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#e5e5e5] font-medium text-sm sm:text-base h-11 sm:h-12 px-8 sm:px-10 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
            >
              Register Now
            </Link>
          </div>
          <div>
            <Link
              href="/login"
              className="rounded-full border border-solid border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-medium text-sm sm:text-base h-11 sm:h-12 px-8 sm:px-10 w-full sm:w-auto shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-left w-full">
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-5">
            <h3 className="font-semibold mb-1">Health Data Recording</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Weight, height, blood pressure, heart rate, sleep, exercise, and more.</p>
          </div>
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-5">
            <h3 className="font-semibold mb-1">AI Health Assessment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Automatically generate summaries, risk levels, and recommendations.</p>
          </div>
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-5">
            <h3 className="font-semibold mb-1">Intelligent Triage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Provide medical priority and recommendations based on symptom information.</p>
          </div>
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-5">
            <h3 className="font-semibold mb-1">Personalized Health Plans</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Diet, exercise, and medication guidance in one place.</p>
          </div>
        </div>
      </main>
      <footer className="row-start-3 text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} HealthMate
      </footer>
    </div>
  );
}
