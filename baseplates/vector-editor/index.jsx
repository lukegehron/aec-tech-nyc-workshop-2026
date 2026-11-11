import dynamic from "next/dynamic";
import { PenTool } from "lucide-react";
import BaseplateLoading from "@/components/BaseplateLoading";
import { bricks } from "./bricks/bricks";

export const vectorEditorBaseplate = {
  id: "vector-editor",
  color: "orange",
  label: "Vector Editor",
  description:
    "A finished reference brick: a scaled 2D drafting canvas with tools, layers, undo, SVG round-trip and AI geometry.",
  icon: PenTool,
  navOrder: 30,
  usesScene: false,
  listBricks: () => bricks,
  Screen: dynamic(() => import("./Screen"), {
    ssr: false,
    loading: () => <BaseplateLoading label="Vector Editor" />,
  }),
};
