export default function LargeTextfield({
  id,
  name,
  secure = false,
  placeholder_text = "Enter your text",
  required = false,
  text,
  onChange,
}: {
  id?: string;
  name?: string;
  secure?: boolean;
  placeholder_text?: string;
  required?: boolean;
  text?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        required={required}
        name={name}
        type={secure ? "password" : "text"}
        className="my-5 block px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900
        bg-transparent rounded-lg border-2 border-gray-300 appearance-none
        dark:text-white dark:border-white dark:focus:border-blue-500
        focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        placeholder=""
        defaultValue={text}
        onChange={onChange}
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
