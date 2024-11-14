export default function Textfield({
  name,
  secure = false,
  text,
  placeholder_text = "Enter your text",
  required = false,
  onChange,
  minLength = 0,
  maxLength = 100,
}: {
  name?: string;
  secure?: boolean;
  text?: string;
  placeholder_text?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <input
        name={name}
        type={secure ? "password" : "text"}
        className="my-5 block px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900
        bg-transparent rounded-lg border-2 border-gray-300 appearance-none
        dark:text-white dark:border-white dark:focus:border-blue-500
        focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        placeholder=""
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        onChange={onChange}
        value={text}
      />
      <label
        className="absolute text-sm text-gray-500 dark:text-gray-400
        duration-300 transform -translate-y-1.5 scale-75 top-2 z-10 origin-[0]
        px-2 peer-focus:px-2 peer-focus:text-blue-600
        peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100
        peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2
        peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-1.5
        rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1
        pointer-events-none"
      >
        {placeholder_text}
      </label>
    </div>
  );
}
