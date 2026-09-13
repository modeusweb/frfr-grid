import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-surface-900 text-surface-900 dark:text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Страница не найдена</h2>
      <p className="text-surface-500 dark:text-surface-400 mb-8">
        Запрашиваемая страница не существует.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-accent-600 text-white hover:bg-accent-700 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
