export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  isCloseable?: boolean;
  width?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
}

function getWidth(
  width: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
) {
  switch (width) {
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "2xl":
      return "max-w-2xl";
    case "3xl":
      return "max-w-3xl";
    case "4xl":
      return "max-w-4xl";
    case "5xl":
      return "max-w-5xl";
    case "6xl":
      return "max-w-6xl";
  }
}

export default function Modal(props: ModalProps) {
  const isCloseable = props.isCloseable ?? true;
  const onClose = props.onClose ?? (() => {});
  const width = getWidth(props.width || "2xl");

  if (!props.isOpen) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 flex justify-center items-center z-50">
      <div
        className={`bg-white dark:bg-black w-screen ${width} p-5 rounded-lg`}
      >
        <div className="flex justify-between items-center pb-5">
          <h3 className="text-2xl font-bold">{props.title}</h3>
          {isCloseable && (
            <button onClick={props.onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        {props.children}
      </div>
    </div>
  );
}