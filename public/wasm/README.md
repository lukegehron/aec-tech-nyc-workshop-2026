# public/wasm

WebAssembly runtimes copied out of `node_modules/` so they are served from this
app rather than fetched from a CDN. Workshop Wi-Fi is not to be trusted, and
both of these loaders default to a CDN path if you don't tell them otherwise.

## `web-ifc.wasm` — IFC

```js
const { IfcAPI } = await import("web-ifc");
const api = new IfcAPI();
api.SetWasmPath("/wasm/");     // <- this folder
await api.Init();
```

```bash
cp node_modules/web-ifc/web-ifc.wasm public/wasm/
```

## `rhino3dm/` — Rhino `.3dm`

three.js's `Rhino3dmLoader` fetches **both** files from the library path — the
`rhino3dm.js` wrapper and the wasm binary next to it — and runs the parse in a
Worker, so they have to sit in the same folder.

```js
const { Rhino3dmLoader } = await import("three/examples/jsm/loaders/3DMLoader.js");
const loader = new Rhino3dmLoader();
loader.setLibraryPath("/wasm/rhino3dm/");   // <- not the default jsDelivr URL
loader.parse(arrayBuffer, onLoad, onError);
```

```bash
cp node_modules/rhino3dm/rhino3dm.js node_modules/rhino3dm/rhino3dm.wasm \
   public/wasm/rhino3dm/
```

Used by `baseplates/viewer3d/bricks/rhino-import-XX/`. Rhino is Z-up and so is
that baseplate, so the geometry needs no fix-up rotation.

Re-copy either of these if the package is ever upgraded — a wasm binary and its
JS wrapper have to be the same version.
