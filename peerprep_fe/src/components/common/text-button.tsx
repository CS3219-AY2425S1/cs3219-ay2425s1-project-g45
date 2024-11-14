import Link from "next/link";

export default function TextButton({
  text = "Button",
  link = "",
  onClick,
}: {
  text?: string;
  link?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={link}
      onClick={onClick}
      className="text-blue-500 hover:underline"
    >
      {text}
    </Link>
  );
}
