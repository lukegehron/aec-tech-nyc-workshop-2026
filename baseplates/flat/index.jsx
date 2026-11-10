import dynamic from "next/dynamic";
import { LayoutGrid } from "lucide-react";
import BaseplateLoading from "@/components/BaseplateLoading";

import { bricks as flatBricks } from "./bricks/bricks";

export const flatBaseplate = {
  id: "flat",
  color: "sand",
  label: "Flat Baseplate",
  description:
    "A blank surface — a grid of cards. Start here. Your first brick is a nametag.",
  icon: LayoutGrid,
  navOrder: 10,
  usesScene: false,
  listBricks: () => flatBricks,
  Screen: dynamic(() => import("./Screen"), {
    ssr: false,
    loading: () => <BaseplateLoading label="Flat Baseplate" />,
  }),
};
