export default function LargeTextfield({
  name,
  secure = false,
  placeholder_text = "Enter your text",
  required = false,
  text,
  onChange,
}: {
  name?: string;
  secure?: boolean;
  placeholder_text?: string;
  required?: boolean;
  text?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      required={required}
      name={name}
      type={secure ? "password" : "text"}
      className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full h-16 p-4 my-3 focus:outline-none"
      placeholder={placeholder_text}
      defaultValue={text}
      onChange={onChange}
    />
  );
}
