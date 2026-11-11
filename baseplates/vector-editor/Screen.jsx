"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hiddenBrickKeysAtom } from "@/lib/bricks";
import { elementsAtom, fitViewAtom, loadSceneAtom } from "./atoms";
import Canvas from "./Canvas";
import StatusBar from "./StatusBar";
import { ActionBar, ToolRail } from "./Toolbar";
import useShortcuts from "./useShortcuts";
import { parseSvg } from "./svgIo";
import { bricks, kitPanels } from "./bricks/bricks";
import { KitTray } from "@/lib/KitTray";

/**
 * The BASEPLATE itself.
 *
 * Everything here is either shell or plumbing: the layout, the shared state
 * in `atoms.js`, the geometry in `geometry.js` / `model.js`, and the canvas
 * that turns pointer events into tool calls. It is deliberately small and it
 * should stay that way.
 *
 * Every actual feature — each drawing tool, each side panel — is a BRICK in
 * `bricks/`, listed in `bricks/bricks.js`. Note that this file contains no
 * list of tools and no list of panels: adding either one means adding a
 * folder and two lines over there, and never editing this file. That's the
 * whole point of the arrangement.
 */

const SAMPLE = "/sample-data/floor-plan.svg";

export default function VectorEditorScreen() {
  useShortcuts();

  const elements = useAtomValue(elementsAtom);
  const loadScene = useSetAtom(loadSceneAtom);
  const fitView = useSetAtom(fitViewAtom);
  const opened = useRef(false);
  const hidden = useAtomValue(hiddenBrickKeysAtom);
  const panels = kitPanels(hidden);

  // Open the sample plan once, so the editor is never a blank rectangle on
  // first visit. Anything already drawn wins.
  useEffect(() => {
    if (opened.current || elements.length) return;
    opened.current = true;
    let cancelled = false;

    fetch(SAMPLE)
      .then((response) => (response.ok ? response.text() : Promise.reject()))
      .then((text) => {
        if (cancelled) return;
        loadScene(parseSvg(text), { name: "Sample floor plan" });
        fitView();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [elements.length, fitView, loadScene]);

  return (
    <div className="flex flex-col gap-3">
      <KitTray baseplateId="vector-editor" bricks={bricks} />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-0 py-0">
          <ActionBar />
          <div className="flex min-h-0">
            <ToolRail />
            <Canvas className="h-[560px] w-full flex-1 bg-muted/40" />
          </div>
          <StatusBar />
        </Card>

        {/* The side panel is generated from the brick registry — it has no list
            of its own. Add a brick with a `panels` entry and a tab appears. */}
        <Card className="gap-0 py-0">
          <Tabs defaultValue={panels[0]?.id} className="gap-0">
            <TabsList variant="line" className="w-full justify-start gap-0 border-b px-1.5 py-1">
              {panels.map((panel) => (
                <TabsTrigger key={panel.id} value={panel.id} className="px-2 text-xs">
                  {panel.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {panels.map((panel) => (
              <TabsContent key={panel.id} value={panel.id} className="p-3">
                <panel.Panel />
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
