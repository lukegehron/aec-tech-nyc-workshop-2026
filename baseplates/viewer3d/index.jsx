import dynamic from "next/dynamic";
import { Boxes } from "lucide-react";
import BaseplateLoading from "@/components/BaseplateLoading";
import { bricks } from "./bricks/bricks";

// The Screen is loaded client-only (ssr: false) because three.js needs a real
// browser. Copy this whole file's shape when you add your own brick.
export const viewer3dBaseplate = {
  id: "viewer3d",
  color: "blue",
  label: "3D Viewer",
  description: "Orbit the project massing, floor plates, or every space.",
  icon: Boxes,
  navOrder: 50,
  usesScene: true,
  listBricks: () => bricks,
  Screen: dynamic(() => import("./Screen"), {
    ssr: false,
    loading: () => <BaseplateLoading label="3D Viewer" />,
  }),
};
