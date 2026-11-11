"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { viewModeAtom } from "../../atoms";
import {
  wallpaperActiveAtom,
  wallpaperApplicationsAtom,
  wallpaperPatternAtom,
  wallpaperStatusAtom,
} from "./atoms";

const TILE_SIZE = 0.6;

const PATTERNS = {
  botanical: (context) => {
    context.fillStyle = "#f4eee4";
    context.fillRect(0, 0, 128, 128);
    for (const [x, y] of [[32, 32], [96, 32], [32, 96], [96, 96]]) {
      context.strokeStyle = "#54735b";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, y + 13);
      context.lineTo(x, y - 10);
      context.stroke();
      context.fillStyle = "#78916e";
      for (const side of [-1, 1]) {
        context.beginPath();
        context.ellipse(x + side * 6, y + 3, 5, 9, side * 0.7, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = "#c88772";
      context.beginPath();
      context.arc(x, y - 12, 4, 0, Math.PI * 2);
      context.fill();
    }
  },
  stripes: (context) => {
    context.fillStyle = "#f5eee3";
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = "#8799a6";
    for (let x = 0; x < 128; x += 32) {
      context.fillRect(x, 0, 10, 128);
    }
    context.fillStyle = "#d5b993";
    for (let x = 16; x < 128; x += 32) {
      context.fillRect(x, 0, 3, 128);
    }
  },
  terrazzo: (context) => {
    context.fillStyle = "#eee7db";
    context.fillRect(0, 0, 128, 128);
    const chips = [
      [18, 19, 6, 4, "#a26f5c"],
      [48, 14, 4, 7, "#758a7b"],
      [83, 25, 7, 3, "#c49b62"],
      [111, 12, 5, 5, "#8696a1"],
      [30, 58, 4, 8, "#8796a2"],
      [67, 55, 8, 4, "#a26f5c"],
      [101, 69, 5, 7, "#758a7b"],
      [15, 99, 7, 3, "#c49b62"],
      [52, 110, 5, 5, "#8696a1"],
      [82, 96, 4, 7, "#a26f5c"],
      [115, 111, 8, 4, "#758a7b"],
    ];
    for (const [x, y, width, height, color] of chips) {
      context.fillStyle = color;
      context.beginPath();
      context.ellipse(x, y, width, height, (x + y) * 0.04, 0, Math.PI * 2);
      context.fill();
    }
  },
};

function createTexture(patternId) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the wallpaper texture.");
  PATTERNS[patternId](context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function hasRhinoRoot(mesh, scene) {
  for (let current = mesh; current && current !== scene; current = current.parent) {
    if (current.userData?.objectType === "File3dm") return true;
  }
  return false;
}

function isMassingBox(mesh, scene, viewMode) {
  return (
    viewMode === "massing-XX" &&
    mesh.geometry?.type === "BoxGeometry" &&
    !hasRhinoRoot(mesh, scene)
  );
}

function isPlanar(mesh, hit) {
  const positions = mesh.geometry?.getAttribute("position");
  if (!positions || positions.count < 3 || !hit.face) return false;

  mesh.updateWorldMatrix(true, false);
  const normal = hit.face.normal
    .clone()
    .applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld))
    .normalize();
  const point = new THREE.Vector3();
  const offset = new THREE.Vector3();
  let radius = 0;
  let maxDistance = 0;

  for (let i = 0; i < positions.count; i += 1) {
    point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
    radius = Math.max(radius, point.distanceTo(hit.point));
    offset.subVectors(point, hit.point);
    maxDistance = Math.max(maxDistance, Math.abs(offset.dot(normal)));
  }

  return radius > 0.05 && maxDistance <= Math.max(0.01, radius * 0.001);
}

function disposeMaterials(material) {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry?.dispose());
  } else {
    material?.dispose();
  }
}

function restoreApplication(application, scene) {
  const {
    mesh,
    originalGeometry,
    originalMaterial,
    wallpaperGeometry,
    wallpaperMaterial,
    textures,
  } = application;
  const isAttached = scene.getObjectById(mesh.id) === mesh;

  if (isAttached && mesh.geometry === wallpaperGeometry) {
    mesh.geometry = originalGeometry;
    mesh.material = originalMaterial;
  } else if (!isAttached) {
    originalGeometry.dispose();
    disposeMaterials(originalMaterial);
  }

  wallpaperGeometry.dispose();
  disposeMaterials(wallpaperMaterial);
  textures.forEach((texture) => texture.dispose());
}

function disposeApplicationLayers(application) {
  application.wallpaperGeometry.dispose();
  disposeMaterials(application.wallpaperMaterial);
}

function createApplication(mesh, hit, patternId, previous, faceIndex) {
  const texture = createTexture(patternId);
  let wallpaperGeometry;
  let wallpaperMaterial;
  try {
    const sourceGeometry = previous?.wallpaperGeometry ?? mesh.geometry;
    const sourceMaterial = previous?.wallpaperMaterial ?? mesh.material;
    wallpaperGeometry = sourceGeometry.clone();
    const positions = wallpaperGeometry.getAttribute("position");
    const normal = hit.face.normal
      .clone()
      .applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld))
      .normalize();
    const reference = Math.abs(normal.z) < 0.95
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(0, 1, 0);
    const uAxis = new THREE.Vector3().crossVectors(reference, normal).normalize();
    const vAxis = new THREE.Vector3().crossVectors(normal, uAxis).normalize();
    const point = new THREE.Vector3();
    const uvs = [];

    for (let i = 0; i < positions.count; i += 1) {
      point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
      uvs.push(point.dot(uAxis) / TILE_SIZE, point.dot(vAxis) / TILE_SIZE);
    }
    wallpaperGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

    if (faceIndex === null) {
      wallpaperMaterial = Array.isArray(sourceMaterial)
        ? sourceMaterial.map((material) => material.clone())
        : sourceMaterial.clone();
      const materials = Array.isArray(wallpaperMaterial)
        ? wallpaperMaterial
        : [wallpaperMaterial];
      for (const material of materials) {
        material.map = texture;
        material.color?.set("#ffffff");
        material.needsUpdate = true;
      }
    } else {
      const materialCount =
        Math.max(...wallpaperGeometry.groups.map((group) => group.materialIndex)) + 1;
      wallpaperMaterial = Array.from({ length: materialCount }, (_, index) => {
        const material = Array.isArray(sourceMaterial)
          ? sourceMaterial[index]
          : sourceMaterial;
        return material.clone();
      });
      wallpaperMaterial[faceIndex].map = texture;
      wallpaperMaterial[faceIndex].color?.set("#ffffff");
      wallpaperMaterial[faceIndex].needsUpdate = true;
    }

    return {
      mesh,
      originalGeometry: previous?.originalGeometry ?? mesh.geometry,
      originalMaterial: previous?.originalMaterial ?? mesh.material,
      wallpaperGeometry,
      wallpaperMaterial,
      textures: [...(previous?.textures ?? []), texture],
    };
  } catch (error) {
    wallpaperGeometry?.dispose();
    disposeMaterials(wallpaperMaterial);
    texture.dispose();
    throw error;
  }
}

function WallpaperScene() {
  const { camera, gl, scene } = useThree();
  const active = useAtomValue(wallpaperActiveAtom);
  const pattern = useAtomValue(wallpaperPatternAtom);
  const viewMode = useAtomValue(viewModeAtom);
  const [applications, setApplications] = useAtom(wallpaperApplicationsAtom);
  const [, updateStatus] = useAtom(wallpaperStatusAtom);
  const applicationsRef = useRef(applications);

  useEffect(() => {
    const removed = applicationsRef.current.filter(
      (application) => !applications.includes(application)
    );
    removed.forEach((application) => restoreApplication(application, scene));
    applicationsRef.current = applications;
  }, [applications, scene]);

  useEffect(
    () => () => {
      applicationsRef.current.forEach((application) =>
        restoreApplication(application, scene)
      );
      applicationsRef.current = [];
    },
    [scene]
  );

  useEffect(() => {
    if (!active) return undefined;

    const element = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt = null;

    const onPointerDown = (event) => {
      downAt = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      if (!downAt) return;
      const travelled = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (travelled > 4) return;

      const rect = element.getBoundingClientRect();
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(scene.children, true).find((intersection) => {
        const mesh = intersection.object;
        if (!mesh.isMesh) return false;
        const isMassing = isMassingBox(mesh, scene, viewMode);
        const isRhinoSurface =
          hasRhinoRoot(mesh, scene) && isPlanar(mesh, intersection);
        return isMassing || isRhinoSurface;
      });

      if (!hit) {
        updateStatus(
          "Select Massing to wallpaper a building face, or click a flat surface in an imported .3dm."
        );
        return;
      }

      try {
        const mesh = hit.object;
        const current = applicationsRef.current;
        const previous = current.find((application) => application.mesh === mesh);
        const next = current.filter((application) => application.mesh !== mesh);
        const isMassing = isMassingBox(mesh, scene, viewMode);
        const faceIndex = isMassing ? hit.face?.materialIndex : null;
        if (isMassing && faceIndex === undefined) {
          updateStatus("Could not identify that building face. Try another surface.");
          return;
        }
        const application = createApplication(
          mesh,
          hit,
          pattern,
          previous,
          faceIndex ?? null
        );
        if (previous) disposeApplicationLayers(previous);
        applicationsRef.current = next;
        mesh.geometry = application.wallpaperGeometry;
        mesh.material = application.wallpaperMaterial;
        const updated = [...next, application];
        applicationsRef.current = updated;
        setApplications(updated);
        updateStatus(
          isMassing
            ? "Wallpaper applied to the building face. Click more faces or Clear to restore."
            : "Wallpaper applied. Click another flat face or Clear to restore."
        );
      } catch (error) {
        updateStatus(`Wallpaper could not be applied: ${error?.message ?? "unknown error"}`);
      }
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointerup", onPointerUp);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    active,
    camera,
    gl,
    pattern,
    scene,
    setApplications,
    updateStatus,
    viewMode,
  ]);

  return null;
}

function WallpaperToolbar() {
  const [active, setActive] = useAtom(wallpaperActiveAtom);
  const [pattern, setPattern] = useAtom(wallpaperPatternAtom);
  const [status, setStatus] = useAtom(wallpaperStatusAtom);
  const [applications, setApplications] = useAtom(wallpaperApplicationsAtom);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border p-0.5">
      <Button
        size="sm"
        variant={active ? "secondary" : "ghost"}
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => {
          const nextActive = !active;
          setActive(nextActive);
          setStatus(
            nextActive
              ? "Click a Massing face or a flat surface in an imported .3dm."
              : "Wallpaper tool paused."
          );
        }}
        title="Click a Massing face or flat imported Rhino surface to apply the selected pattern"
      >
        <ImageIcon className="size-3.5" aria-hidden="true" />
        Wallpaper
      </Button>

      <NativeSelect
        size="sm"
        className="w-36"
        aria-label="Wallpaper pattern"
        value={pattern}
        onChange={(event) => setPattern(event.target.value)}
      >
        <NativeSelectOption value="botanical">Botanical</NativeSelectOption>
        <NativeSelectOption value="stripes">Stripes</NativeSelectOption>
        <NativeSelectOption value="terrazzo">Terrazzo</NativeSelectOption>
      </NativeSelect>

      {applications.length > 0 ? (
        <>
          <span className="px-1 text-xs text-muted-foreground">
            {applications.length} surface{applications.length === 1 ? "" : "s"}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              setApplications([]);
              setStatus("Wallpaper cleared; original surface materials restored.");
            }}
            title="Restore original materials on all wallpapered surfaces"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        </>
      ) : null}

      <span className="max-w-64 px-1 text-xs text-muted-foreground" role="status">
        {status}
      </span>
    </div>
  );
}

export const wallpaperBrick = {
  id: "wallpaper-JD",
  label: "Wallpaper",
  hint: "Apply a built-in wallpaper pattern to flat imported Rhino surfaces",
  order: 70,
  Toolbar: WallpaperToolbar,
  Scene3d: WallpaperScene,
};
