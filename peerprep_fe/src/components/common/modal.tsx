"use client";
import { useEffect, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  isCloseable?: boolean;
  isScrollable?: boolean;
  height?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
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

function getHeight(
  height: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
) {
  switch (height) {
    case "md":
      return "max-h-md";
    case "lg":
      return "max-h-lg";
    case "xl":
      return "max-h-xl";
    case "2xl":
      return "max-h-2xl";
    case "3xl":
      return "max-h-3xl";
    case "4xl":
      return "max-h-4xl";
    case "5xl":
      return "max-h-5xl";
    case "6xl":
      return "max-h-6xl";
  }
}

export default function Modal(props: ModalProps) {
  const isCloseable = props.isCloseable ?? true;
  const width = getWidth(props.width || "2xl");
  const height =
    props.height || props.isScrollable ? getHeight(props.height ?? "2xl") : "";

  if (!props.isOpen) {
    return null;
  }

  return (
    <div
      className={`${props.isOpen ? "animate-fade-in" : "animate-fade-out pointer-events-none"}
                  fixed top-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 flex
                  z-50 justify-center items-center`}
    >
      <div
        className={`bg-white dark:bg-black w-screen ${width} rounded-lg
        ${props.isOpen ? "animate-slide-in" : "animate-slide-out"} `}
      >
        <div className="flex justify-between items-center pt-5 px-5">
          <h3 className="text-2xl font-bold">{props.title}</h3>
          {isCloseable && (
            <button onClick={props.onClose} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div
          className={`pb-5 px-5 ${height} ${props.isScrollable ? "overflow-y-auto scroll-smooth" : ""}`}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}
