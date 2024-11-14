import Link from "next/link";

export default function Button({
  type = "button",
  text = "Button",
  link = "",
  onClick,
  loading = false,
  disabled = false,
}: {
  type?: "button" | "submit" | "reset" | undefined;
  text?: string;
  link?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
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

  // Define button classes conditionally based on the button type
  const buttonClasses = `
    ${type === "reset" ? "bg-red-500 hover:bg-red-700" : "bg-indigo-500 hover:bg-indigo-700"}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    text-white font-bold px-3 py-3 my-3 w-full rounded-lg flex justify-center items-center focus:outline-none
    ${!disabled && "transition duration-150 ease-in-out"}
  `.trim();

  const button = (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );

  if (link !== "" && !disabled) {
    return <Link href={link}>{button}</Link>;
  }

  return button;
}
