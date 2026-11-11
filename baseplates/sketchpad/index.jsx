import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";
import BaseplateLoading from "@/components/BaseplateLoading";
import { bricks } from "./bricks/bricks";

export const sketchpadBaseplate = {
  id: "sketchpad",
  color: "yellow",
  label: "Sketchpad",
  description: "Freehand p5.js canvas. A brush is one function.",
  icon: Pencil,
  navOrder: 20,
  usesScene: false,
  listBricks: () => bricks,
  Screen: dynamic(() => import("./Screen"), {
    ssr: false,
    loading: () => <BaseplateLoading label="Sketchpad" />,
  }),
};
