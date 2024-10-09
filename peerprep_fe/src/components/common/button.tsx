import Link from "next/link";

export default function Button({
  type = "button",
  text = "Button",
  link = "",
  onClick,
  loading = false,
}: {
  type?: "button" | "submit" | "reset" | undefined;
  text?: string;
  link?: string;
  onClick?: () => void;
  loading?: boolean;
}) {
  const buttonContent = loading ? (
    <>
      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </>
  ) : (
    text
  );

  const button = (
    <button
      type={type}
      className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold px-3 py-3 my-3 w-full rounded-lg flex justify-center items-center focus:outline-none"
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );

  if (link != "") {
    return <Link href={link}>{button}</Link>;
  }
  return button;
}
