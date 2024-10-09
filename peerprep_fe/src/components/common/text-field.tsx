export default function Textfield({
  name,
  secure = false,
  placeholder_text = "Enter your text",
  required = false,
  minLength = 0,
  maxLength = 100,
}: {
  name?: string;
  secure?: boolean;
  placeholder_text?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <input
      name={name}
      type={secure ? "password" : "text"}
      className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full p-4 my-3 focus:outline-none"
      placeholder={placeholder_text}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
    />
  );
}
