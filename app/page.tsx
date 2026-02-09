import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Welcome</h1>
      <p className="mb-6 text-gray-600">
        Create and manage your invoices.
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href="/invoices"
            className="text-blue-600 hover:underline"
          >
            View invoices
          </Link>
        </li>
        <li>
          <Link
            href="/invoices/new"
            className="text-blue-600 hover:underline"
          >
            Create new invoice
          </Link>
        </li>
      </ul>
    </div>
  );
}
