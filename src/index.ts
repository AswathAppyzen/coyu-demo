// @ts-nocheck
import XLSX from "xlsx";
import { fabric } from "fabric";
import { nanoid } from "nanoid";
import sharp from "sharp";

console.log("Reading coyu-test.xlsx file...");

// Constants
const backgroundLayerType = "CHECKBOX_BACKGROUND";
const INITIAL_FRAME_ID = "Main Artboard";

export enum TextListType {
  BULLET = "bullet",
  NUMBER = "number",
  NONE = "none",
}

export const canvasPropertiesToInclude = [
  "id",
  "name",
  "left",
  "top",
  "width",
  "height",
  "scaleX",
  "scaleY",
  "opacity",
  "flipX",
  "flipY",
  "skewX",
  "skewY",
  "stroke",
  "strokeWidth",
  "originX",
  "originY",
  "angle",
  "filters",
  "locked",
  "hasControls",
  "editable",
  "lockMovementX",
  "lockMovementY",
  "lockRotation",
  "lockScalingX",
  "lockScalingY",
  "lockUniScaling",
  "clipPath",
  "fill",
  "metadata",
  "shadow",
  "backgroundColor",
  "type",
  "preview",
  "src",
  "fontFamily",
  "fontSize",
  "fontURL",
  "text",
  "textAlign",
  "textLines",
  "underline",
  "listBullet",
  "listType",
  "lineHeight",
  "charSpacing",
  "cropX",
  "cropY",
  "colorMap",
  "objectColors",
  "_objects",
  "subTargetCheck",
  "padding",
  "strokeLineCap",
  "strokeLineJoin",
  "strokeUniform",
  "isDummy",
  "maskSvgUrl",
  "subObjectScaleX",
  "subObjectScaleY",
  "eraser",
  "maskFill",
  "maskFillOpacity",
  "visible",
];

const LayerType = {
  MASK: "Mask",
  ARTBOARD: "Artboard",
  STAR: "star",
  ARROW_LINE: "arrowline",
  RECT: "rect",
  CIRCLE: "circle",
  LINE: "line",
  TRIANGLE: "triangle",
  DYNAMIC_POLYGON: "DynamicPolygon",
  CURSOR: "cursor",
  STATIC_IMAGE: "StaticImage",
  STATIC_TEXT: "StaticText",
  TEXT: "text",
  BACKGROUND_IMAGE: "BackgroundImage",
  STATIC_VIDEO: "StaticVideo",
  STATIC_VECTOR: "StaticVector",
  STATIC_PATH: "StaticPath",
  BACKGROUND: "Background",
  FRAME: "Frame",
};

const SLIDER_TYPE = {
  SIZE: "size",
  LINE_HEIGHT: "lineHeight",
  LETTER_SPACING: "letterSpacing",
  BRIGHTNESS: "BRIGHTNESS",
  CONTRAST: "CONTRAST",
  SATURATION: "SATURATION",
  HUE: "HUE",
  OPACITY: "OPACITY",
  BLUR: "BLUR",
  HIGHLIGHT: "HIGHLIGHT",
  LOWLIGHT: "LOWLIGHT",
  TEMPERATURE: "TEMPERATURE",
  BANDW: "BANDW",
  NOIR: "NOIR",
  FADE: "FADE",
  MONO: "MONO",
  A2I: "A2I",
  CITY: "CITY",
  BLISS: "BLISS",
  TONAL: "TONAL",
  HDR: "HDR",
  LOMO: "LOMO",
  MATTE: "MATTE",
  FILM: "FILM",
  VIBRANT: "VIBRANT",
  COOLTONE: "COOLTONE",
  VIBRANCE: "VIBRANCE",
  NOISE: "NOISE",
  PIXELATE: "PIXELATE",
  ROTATE: "rotate",
  CIRCULARTEXT: "CIRCULARTEXT",
  ARCHTEXT: "ARCHTEXT",
  ANGLETEXT: "ANGLETEXT",
  RISETEXT: "RISETEXT",
  WAVETEXT: "WAVETEXT",
  FLAGTEXT: "FLAGTEXT",
  POLAROID: "Polaroid",
  SEPIA: "Sepia",
  GRAYSCALE: "Grayscale",
  KODACHROME: "KODACHROME",
  BROWNIE: "Brownie",
  VINTAGE: "Vintage",
  TECHNICOLOR: "Technicolor",
  INVERT: "Invert",
  SHARPEN: "Sharpen",
  EMBOSS: "Emboss",
  REMOVECOLOR: "RemoveColor",
  BLACKNWHITE: "BlacknWhite",
  GAMMA: "Gamma",
  BLENDCOLOR: "BlendColor",
};

// STEP 1: read the xlsx file from URL

async function readXlsxFromUrl(url: string) {
  const xlsxUrl = url;

  try {
    console.log("Fetching XLSX file from URL...");

    const response = await fetch(xlsxUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    console.log("Sheet name:", sheetName);

    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log("JSON data:");
    console.log(JSON.stringify(json, null, 2));

    return json;
  } catch (error) {
    console.error("Error reading file from URL:", error.message);
    return null;
  }
}

// Declare layerhub classes

export class StaticImageObject extends fabric.Image {
  static type = "StaticImage";
  public role: string = "regular";
  //@ts-ignore
  initialize(element, options) {
    this.role = element.role;
    options.type = "StaticImage";
    //@ts-ignore
    super.initialize(element, options);
    return this;
  }

  static fromObject(options: any, callback: Function) {
    fabric.util.loadImage(
      options.src,
      function (img) {
        // @ts-ignore
        return callback && callback(new fabric.StaticImage(img, options));
      },
      null,
      // @ts-ignore
      { crossOrigin: "anonymous" }
    );
  }

  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
}

fabric.StaticImage = fabric.util.createClass(StaticImageObject, {
  type: StaticImageObject.type,
});
fabric.StaticImage.fromObject = StaticImageObject.fromObject;

export interface StaticImageOptions extends fabric.IImageOptions {
  id: string;
  name?: string;
  description?: string;
  subtype: string;
  src: string;
}

declare module "fabric" {
  namespace fabric {
    class StaticImage extends StaticImageObject {
      constructor(element: any, options: any);
    }
  }
}

export class StaticTextObject extends fabric.Textbox {
  static type = "StaticText";
  public fontURL;
  initialize(options: StaticTextOptions) {
    const { text, ...textOptions } = options;
    //@ts-ignore
    super.initialize(text, { ...textOptions });

    return this;
  }
  toObject(propertiesToInclude = []) {
    // const originalText = this.getText()
    return fabric.util.object.extend(
      super.toObject.call(this, propertiesToInclude),
      {
        fontURL: this.fontURL,
        // keys: this.keys,
        // originalText: originalText,
        // metadata: this.metadata,
      }
    );
  }
  toJSON(propertiesToInclude = []) {
    // const originalText = this.getText()
    return fabric.util.object.extend(
      super.toObject.call(this, propertiesToInclude),
      {
        fontURL: this.fontURL,
        // keys: this.keys,
        // originalText: originalText,
        // metadata: this.metadata,
      }
    );
  }
  static fromObject(options: StaticTextOptions, callback: Function) {
    return callback && callback(new fabric.StaticText(options));
  }
}

fabric.StaticText = fabric.util.createClass(StaticTextObject, {
  type: StaticTextObject.type,
});
fabric.StaticText.fromObject = StaticTextObject.fromObject;

export type StaticTextOptions = fabric.ITextboxOptions & {
  text: string;
  fontURL: string;
};

declare module "fabric" {
  namespace fabric {
    class StaticText extends StaticTextObject {
      constructor(options: StaticTextOptions);
    }
  }
}

import pkg from 'lodash';
const { groupBy } = pkg;
class StaticVectorObject extends fabric.Group {
  static type = "StaticVector";
  public src: string;
  public objectColors: Record<string, any[]> = {};
  public colorMap = {};

  public updateLayerColor(prev: string, next: string) {
    const sameObjects = this.objectColors[prev];

    if (sameObjects) {
      sameObjects.forEach((c) => {
        c.fill = next;
      });
      this.canvas?.requestRenderAll();
      // @ts-ignore
      this.colorMap[prev] = next;
    }
  }

  //@ts-ignore
  initialize(objects, options, others) {
    const existingColorMap = others.colorMap;
    const objectColors = groupBy(objects, "fill");
    // set colorMap
    if (existingColorMap) {
      Object.keys(existingColorMap).forEach((color) => {
        const colorObjects = objectColors[color];
        if (colorObjects) {
          // @ts-ignore
          colorObjects.forEach((c) => {
            c.fill = existingColorMap[color];
          });
        }
      });
    }
    this.objectColors = objectColors;

    const colorMap: Record<string, string> = {};

    Object.keys(objectColors).forEach((c) => {
      colorMap[c] = c;
    });
    if (existingColorMap) {
      Object.keys(existingColorMap).forEach((c) => {
        colorMap[c] = existingColorMap[c];
      });
    }
    this.colorMap = colorMap;

    const object = fabric.util.groupSVGElements(objects, options);
    //@ts-ignore
    super.initialize([object], { ...others, colorMap });
    this.set("src", others.src);

    return this;
  }

  toObject(propertiesToInclude = []) {
    // @ts-ignore
    return super.toObject(propertiesToInclude, {
      src: this.src,
    });
  }
  toJSON(propertiesToInclude = []) {
    // @ts-ignore
    return super.toObject(propertiesToInclude, {
      src: this.src,
    });
  }

  static fromObject(options: any, callback: Function) {
    fabric.loadSVGFromURL(options.src, (objects, opts) => {
      return (
        callback &&
        callback(new fabric.StaticVector(objects, opts, { ...options }))
      );
    });
  }
}

fabric.StaticVector = fabric.util.createClass(StaticVectorObject, {
  type: StaticVectorObject.type,
});

fabric.StaticVector.fromObject = StaticVectorObject.fromObject;

export type SvgOptions = fabric.Group & { text: string };

declare module "fabric" {
  namespace fabric {
    class StaticVector extends StaticVectorObject {
      constructor(objects: any, options: any, others: any);
    }
  }
}

export class StaticVideoObject extends fabric.Image {
  static type = "StaticVideo";
  initialize(video: HTMLVideoElement, options: any) {
    const defaultOpts = {
      objectCaching: false,
      cacheProperties: ["time"],
    };
    options = options || {};

    super.initialize(video, Object.assign({}, defaultOpts, options));
    return this;
  }

  _draw(video, ctx, w, h) {
    const d = {
      x: -this.width / 2,
      y: -this.height / 2,
      w: this.width,
      h: this.height,
    };
    ctx.drawImage(video, d.x, d.y, d.w, d.h);
  }
  _render(ctx) {
    this._draw(this.getElement(), ctx);
  }

  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(
      super.toObject.call(this, propertiesToInclude),
      {}
    );
  }
  toJSON(propertiesToInclude = []) {
    return fabric.util.object.extend(
      super.toObject.call(this, propertiesToInclude),
      {}
    );
  }
}
fabric.StaticVideo = fabric.util.createClass(StaticVideoObject, {
  type: StaticVideoObject.type,
});

declare module "fabric" {
  namespace fabric {
    class StaticVideo extends StaticVideoObject {
      constructor(element: any, options: any);
    }
  }
}

export class StaticPathObject extends fabric.Path {
  static type = "StaticPath";

  initialize(options: StaticPathOptions) {
    const { path, ...pathOptions } = options;
    //@ts-ignore
    super.initialize(path, pathOptions);

    return this;
  }
  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
  static fromObject(options: StaticPathOptions, callback: Function) {
    return callback && callback(new fabric.StaticPath(options));
  }
}

fabric.StaticPath = fabric.util.createClass(StaticPathObject, {
  type: StaticPathObject.type,
});
fabric.StaticPath.fromObject = StaticPathObject.fromObject;

export type StaticPathOptions = fabric.IPathOptions & { path: string };

declare module "fabric" {
  namespace fabric {
    class StaticPath extends StaticPathObject {
      constructor(options: StaticPathOptions);
    }
  }
}

export class StaticAudioObject extends fabric.Object {
  static type = "StaticAudio";
  initialize(options: StaticAudioOptions) {
    super.initialize({
      width: 0,
      height: 0,
      selectable: false,
      evented: false,
      visible: false,
      ...options,
    });
    return this;
  }

  static fromObject(options: StaticAudioOptions, callback: Function) {
    return callback && callback(new fabric.StaticAudio(options));
  }
}

fabric.StaticAudio = fabric.util.createClass(StaticAudioObject, {
  type: StaticAudioObject.type,
});
fabric.StaticAudio.fromObject = StaticAudioObject.fromObject;

export interface StaticAudioOptions extends fabric.IObjectOptions {
  id: string;
  name: string;
  src: string;
}

declare module "fabric" {
  namespace fabric {
    class StaticAudio extends StaticAudioObject {
      constructor(options: StaticAudioOptions);
    }
  }
}

export class FrameObject extends fabric.Rect {
  static type = "Frame";
  initialize(options: FrameOptions) {
    super.initialize({
      ...options,
      selectable: false,
      hasControls: false,
      lockMovementY: true,
      lockMovementX: true,
      strokeWidth: 0,
      padding: 0,
      evented: false,
    });
    return this;
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude);
  }

  static fromObject(options: FrameOptions, callback: Function) {
    return callback && callback(new fabric.Frame(options));
  }
}

fabric.Frame = fabric.util.createClass(FrameObject, {
  type: FrameObject.type,
});
fabric.Frame.fromObject = FrameObject.fromObject;

export interface FrameOptions extends fabric.IRectOptions {
  id: string;
  name: string;
  description?: string;
}

declare module "fabric" {
  namespace fabric {
    class Frame extends FrameObject {
      constructor(options: FrameOptions);
    }
  }
}

export class BackgroundImageObject extends fabric.Image {
  static type = "BackgroundImage";
  //@ts-ignore
  initialize(element, options) {
    options.type = "BackgroundImage";
    //@ts-ignore
    super.initialize(element, {
      ...options,
      hasControls: false,
      lockMovementY: true,
      lockMovementX: true,
      selectable: false,
      hoverCursor: "default",
      hasBorders: false,
    });

    this.on("mouseup", ({ target }) => {
      const activeSelection = this.canvas.getActiveObject();
      if (!activeSelection && target === this) {
        this.canvas.fire("background:selected");
      }
    });

    this.on("mousedblclick", () => {
      this.set({
        hasControls: true,
        lockMovementY: false,
        lockMovementX: false,
        hasBorders: true,
      });
      this.canvas.setActiveObject(this);
      this.canvas.requestRenderAll();
    });

    return this;
  }

  static fromObject(options: any, callback: Function) {
    fabric.util.loadImage(
      options.src,
      function (img) {
        // @ts-ignore
        return callback && callback(new fabric.BackgroundImage(img, options));
      },
      null,
      // @ts-ignore
      { crossOrigin: "anonymous" }
    );
  }

  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude);
  }
}

fabric.BackgroundImage = fabric.util.createClass(BackgroundImageObject, {
  type: BackgroundImageObject.type,
});
fabric.BackgroundImage.fromObject = BackgroundImageObject.fromObject;

export interface BackgroundImageOptions extends fabric.IImageOptions {
  id: string;
  name?: string;
  description?: string;
  subtype: string;
  src: string;
}

declare module "fabric" {
  namespace fabric {
    class BackgroundImage extends BackgroundImageObject {
      constructor(element: any, options: any);
    }

    interface IUtil {
      isTouchEvent(event: Event): boolean;
      getPointer(event: Event, a?: any): Point;
    }
  }
}

const defaultShadow = {
  blur: 10,
  color: "#C7C7C7",
  offsetX: 0,
  offsetY: 0,
};
// @ts-ignore
export class BackgroundObject extends fabric.Rect {
  static type = "Background";
  initialize(options: BackgroundOptions) {
    const shadowOptions = options.shadow ? options.shadow : defaultShadow;
    const shadow = new fabric.Shadow({
      affectStroke: false,
      // @ts-ignore
      ...shadowOptions,
    });
    super.initialize({
      ...options,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      lockMovementY: true,
      lockMovementX: true,
      strokeWidth: 0,
      evented: true,
      hoverCursor: "default",
      shadow,
    });

    this.on("mouseup", ({ target }) => {
      const activeSelection = this.canvas.getActiveObject();
      if (!activeSelection && target === this) {
        this.canvas.fire("background:selected");
      }
    });
    return this;
  }

  toObject(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude: string[] = []) {
    return super.toObject(propertiesToInclude);
  }

  static fromObject(options: BackgroundOptions, callback: Function) {
    return callback && callback(new fabric.Background(options));
  }
}

fabric.Background = fabric.util.createClass(BackgroundObject, {
  type: BackgroundObject.type,
});
fabric.Background.fromObject = BackgroundObject.fromObject;

export interface BackgroundOptions extends fabric.IRectOptions {
  id: string;
  name: string;
  description?: string;
}

declare module "fabric" {
  namespace fabric {
    class Background extends BackgroundObject {
      constructor(options: BackgroundOptions);
    }
  }
}

type PathCommand = "M" | "Q" | "L" | string;
type PathPoint = [PathCommand, number, number];
type Coordinates = { x: number; y: number };

// Custom Empty text handling for all kind of text layers (Instead of "Empty Text" we use " ")
(function () {
  const originalInitialize = fabric.Text.prototype.initialize;
  fabric.Text.prototype.initialize = function (text, options) {
    text = text === null || text === "" ? " " : text;
    return originalInitialize.call(this, text, options);
  };

  const originalSet = fabric.Text.prototype.set;
  fabric.Text.prototype.set = function (key, value) {
    if (key === "text" && (value === "" || value === null)) {
      value = " ";
    }
    return originalSet.call(this, key, value);
  };

  const originalRenderTextLines = fabric.Text.prototype._renderTextLines;
  fabric.Text.prototype._renderTextLines = function (ctx, method) {
    if (!this.text || this.text === "") {
      this.text = " ";
    }
    return originalRenderTextLines.call(this, ctx, method);
  };
})();

// const _getTransformedDimensions =
//   fabric.Image.prototype._getTransformedDimensions;
// fabric.Image.prototype._getTransformedDimensions = function (
//   options: any = {}
// ) {
//   debugger;
//   if (this.type === LayerType.MASK && this.clipPath) {
//     return this.clipPath._getTransformedDimensions(options);
//   }

//   return _getTransformedDimensions.bind(this)(options);
//   // const dimOptions = {
//   //   scaleX: this.scaleX,
//   //   scaleY: this.scaleY,
//   //   skewX: this.skewX,
//   //   skewY: this.skewY,
//   //   width: this.width,
//   //   height: this.height,
//   //   strokeWidth: this.strokeWidth,
//   //   ...options,
//   // };
//   // // stroke is applied before/after transformations are applied according to `strokeUniform`
//   // const strokeWidth = dimOptions.strokeWidth;
//   // let preScalingStrokeValue = strokeWidth,
//   //   postScalingStrokeValue = 0;

//   // if (this.strokeUniform) {
//   //   preScalingStrokeValue = 0;
//   //   postScalingStrokeValue = strokeWidth;
//   // }
//   // const dimX = dimOptions.width + preScalingStrokeValue,
//   //   dimY = dimOptions.height + preScalingStrokeValue,
//   //   noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0;
//   // let finalDimensions;
//   // if (noSkew) {
//   //   finalDimensions = new Point(
//   //     dimX * dimOptions.scaleX,
//   //     dimY * dimOptions.scaleY
//   //   );
//   // } else {
//   //   finalDimensions = sizeAfterTransform(dimX, dimY, dimOptions);
//   // }

//   // return finalDimensions.scalarAdd(postScalingStrokeValue);
// };
function isPointNearPathPoint(
  pointerCoords: Coordinates,
  pathPoints: PathPoint[],
  threshold: number = 5
): {
  isNear: boolean;
  minDistance: number;
  nearestPointIndex: number;
} {
  // Convert path points to coordinates
  const pathCoordinates: Coordinates[] = pathPoints
    .map((point) => {
      // Only consider points with x and y coordinates (skip command points)
      return point.length > 2 ? { x: point[1], y: point[2] } : null;
    })
    .filter((point): point is Coordinates => point !== null);
  // Calculate distances
  const distances: number[] = pathCoordinates.map((pathPoint) => {
    return Math.sqrt(
      Math.pow(pointerCoords.x - pathPoint.x, 2) +
        Math.pow(pointerCoords.y - pathPoint.y, 2)
    );
  });
  // Find the minimum distance
  const minDistance = Math.min(...distances);
  // Find the index of the nearest point
  const nearestPointIndex = distances.indexOf(minDistance);
  return {
    isNear: minDistance <= threshold,
    minDistance: minDistance,
    nearestPointIndex: nearestPointIndex,
  };
}
fabric.loadSVGFromURL = function (url, callback, reviver, options) {
  url = url.replace(/^\n\s*/, "").trim();
  new fabric.util.request(url, {
    method: "get",
    onComplete: onComplete,
  });

  function onComplete(r) {
    var xml = r.responseXML;
    if (!xml || !xml.documentElement) {
      callback && callback(null);
      return false;
    }
    xml?.documentElement?.removeAttribute("width");
    xml?.documentElement?.removeAttribute("height");
    fabric.parseSVGDocument(
      xml.documentElement,
      function (results, _options, elements, allElements) {
        callback && callback(results, _options, elements, allElements);
      },
      reviver,
      options
    );
  }
};
export const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
  initialize: function (canvas, editor, currentStrokeWidth) {
    this.canvas = canvas;
    this.editor = editor;
    this.currentStrokeWidth = currentStrokeWidth;
    this.callSuper("initialize", canvas);
  },

  onMouseDown: function (pointer) {
    if (!this.canvas) return;

    this._addPoint(pointer);

    const intersectingObjects = this.canvas.getObjects().filter((obj) => {
      if (obj.type === "StaticPath") {
        // return obj.type === 'StaticPath' && obj.intersectsWithObject(path);
        let transform = obj.calcTransformMatrix();
        let pathOffset = obj.pathOffset;
        transform = fabric.util.multiplyTransformMatrices(transform, [
          1,
          0,
          0,
          1,
          -pathOffset.x,
          -pathOffset.y,
        ]);

        const tranformedPaths = obj?.path?.map(function (pathSegment) {
          var newSegment = pathSegment.slice(0),
            point = {};
          for (var i = 1; i < pathSegment.length - 1; i += 2) {
            point.x = pathSegment[i];
            point.y = pathSegment[i + 1];
            point = fabric.util.transformPoint(point, transform);
            newSegment[i] = point.x;
            newSegment[i + 1] = point.y;
          }

          return newSegment;
        });

        return isPointNearPathPoint(
          pointer,
          tranformedPaths,
          this.currentStrokeWidth / 2
        ).isNear;
      }
    });

    if (intersectingObjects.length > 0) {
      intersectingObjects.forEach((obj) => {
        this.canvas.remove(obj);
      });
    }

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.renderAll();
  },

  onMouseMove: function (pointer) {
    if (!this.canvas || !this._points || this._points.length === 0) return;

    this._addPoint(pointer);

    const pathData = this.convertPointsToSVGPath(this._points).join("");
    if (pathData === "M 0 0 Q 0 0 0 0 L 0 0") {
      return;
    }

    const path = this.createPath(pathData);
    path.globalCompositeOperation = "destination-out";
    path.selectable = false;
    path.evented = false;
    path.absolutePositioned = true;

    // Check and remove intersecting objects of type `StaticPath`
    const intersectingObjects = this.canvas.getObjects().filter((obj) => {
      if (obj.type === "StaticPath") {
        // return obj.type === 'StaticPath' && obj.intersectsWithObject(path);
        let transform = obj.calcTransformMatrix();
        let pathOffset = obj.pathOffset;
        transform = fabric.util.multiplyTransformMatrices(transform, [
          1,
          0,
          0,
          1,
          -pathOffset.x,
          -pathOffset.y,
        ]);

        const tranformedPaths = obj?.path?.map(function (pathSegment) {
          var newSegment = pathSegment.slice(0),
            point = {};
          for (var i = 1; i < pathSegment.length - 1; i += 2) {
            point.x = pathSegment[i];
            point.y = pathSegment[i + 1];
            point = fabric.util.transformPoint(point, transform);
            newSegment[i] = point.x;
            newSegment[i + 1] = point.y;
          }

          return newSegment;
        });

        return isPointNearPathPoint(
          pointer,
          tranformedPaths,
          this.currentStrokeWidth / 2
        ).isNear;
      }
    });

    if (intersectingObjects.length > 0) {
      intersectingObjects.forEach((obj) => {
        this.canvas.remove(obj);
      });
    }

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.renderAll();
  },

  _finalizeAndAddPath: function () {
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.renderAll();
    this._resetShadow();
    this.editor.history.save();
  },
});

export const getFilterObject = (objectFilter: any) => {
  if (!objectFilter) {
    return new fabric.Image.filters.Grayscale();
  }

  const { type } = objectFilter;
  let filter;
  if (type === "Brightness") {
    filter = new fabric.Image.filters.Brightness({
      brightness: objectFilter.brightness,
    });
  } else if (type === "Blur") {
    filter = new fabric.Image.filters.Blur({
      blur: objectFilter.blur,
    });
  } else if (type === "Contrast") {
    filter = new fabric.Image.filters.Contrast({
      contrast: objectFilter.contrast,
    });
  } else if (type === "Saturation") {
    filter = new fabric.Image.filters.Saturation({
      saturation: objectFilter.saturation,
    });
  } else if (type === "HueRotation") {
    filter = new fabric.Image.filters.HueRotation({
      rotation: objectFilter.rotation,
    });
  } else if (type === "Highlight") {
    filter = new fabric.Image.filters.Highlight({
      highlight: objectFilter.highlight,
    });
  } else if (type === "Lowlight") {
    filter = new fabric.Image.filters.Lowlight({
      lowlight: objectFilter.lowlight,
    });
  } else if (type === "Temperature") {
    filter = new fabric.Image.filters.Temperature({
      temperature: objectFilter.temperature,
    });
  } else if (type === "Vibrance") {
    filter = new fabric.Image.filters.Vibrance({
      vibrance: objectFilter.vibrance,
    });
  } else if (type === "Pixelate") {
    filter = new fabric.Image.filters.Pixelate({
      blocksize: objectFilter.blocksize,
    });
  } else if (type === "Noise") {
    filter = new fabric.Image.filters.Noise({
      noise: objectFilter.noise,
    });
  } else if (type === "BlendColor") {
    filter = new fabric.Image.filters.BlendColor({
      color: objectFilter.color,
      mode: objectFilter.mode,
      alpha: objectFilter.alpha,
    });
  }

  return filter;
};

if (fabric) {
  let fromObjectCallback = fabric.StaticImage.fromObject;
  fabric.StaticImage.fromObject = function (options, callback) {
    const filters: IBaseFilter[] = [];
    options.filters?.forEach((filter: any) => {
      if (filter instanceof fabric.Image.filters.BaseFilter) {
        filters.push(filter);
        return;
      }

      let filterObject = getFilterObject(filter);
      if (!filterObject) {
        filterObject = getConvoluteFilter(filter.type)[0];
      }

      filters.push(filterObject);
    });

    options.filters = filters;
    fromObjectCallback(options, callback);
  };

  const applyFilterCallback = fabric.Image.prototype.applyFilters;
  fabric.Image.prototype.applyFilters = function (filters) {
    let IBasefilters: IBaseFilter[] = [];
    if (filters === undefined) {
      filters = this?.filters || [];
    }
    filters?.forEach((filter: any) => {
      if (filter instanceof fabric.Image.filters.BaseFilter) {
        IBasefilters.push(filter);
        return;
      }

      let filterObject = getFilterObject(filter);
      if (!filterObject) {
        filterObject = getConvoluteFilter(filter.type)[0];
      }

      IBasefilters.push(filterObject);
    });

    return applyFilterCallback.bind(this)(
      IBasefilters.length === 0 ? undefined : IBasefilters
    );
  };
}

// Add bullet text functionality to Textbox
(() => {
  fabric.Textbox.prototype.lineStyles = {};
  fabric.Textbox.prototype.bulletStyleMap = ["", "●", "■"];

  // fabric.Textbox.prototype._splitText = function () {
  //   const objectWidth = this.width;
  //   const textLines = this.text?.split('\n');
  //   const canvas = document.createElement('canvas');
  //   const context = canvas.getContext('2d');
  //   context.font = `${this.fontSize}px "${this.fontFamily || 'Arial'}"`;

  //   let maxLineWidth = 0;
  //   let totalTextWidth = 0;

  //   textLines.forEach((line) => {
  //     const lineWidth = context.measureText(line).width;
  //     totalTextWidth += lineWidth;
  //     if (lineWidth > maxLineWidth) {
  //       maxLineWidth = lineWidth;
  //     }
  //   });

  //   const isList = this.isListType();
  //   let textToUse = this.text;

  //   let newLines;
  //   if (!isList && maxLineWidth > objectWidth) {
  //     const cleanedText = textToUse.replace(/\n/g, ' ');
  //     newLines = this._splitTextIntoLines(cleanedText);
  //   } else {
  //     newLines = this._splitTextIntoLines(textToUse);
  //   }

  //   this.textLines = newLines.lines;
  //   this._textLines = newLines.graphemeLines;
  //   this._unwrappedTextLines = newLines._unwrappedLines;
  //   this._text = newLines.graphemeText;
  //   return newLines;
  // };

  fabric.Textbox.prototype._wrapLine = function (
    _line,
    lineIndex,
    desiredWidth
  ) {
    var lineWidth = 0,
      graphemeLines = [],
      line = [],
      words = _line.split(this._reSpaceAndTab),
      word = "",
      offset = 0,
      infix = " ",
      wordWidth = 0,
      infixWidth = 0,
      largestWordWidth = 0,
      lineJustStarted = true,
      additionalSpace = this._getWidthOfCharSpacing();
    desiredWidth -= this.getIndentSpace(lineIndex);
    for (var i = 0; i < words.length; i++) {
      word = fabric.util.string.graphemeSplit(words[i]);
      wordWidth = this._measureWord(word, lineIndex, offset);
      offset += word.length;
      lineWidth += infixWidth + wordWidth - additionalSpace;
      if (lineWidth >= desiredWidth && !lineJustStarted) {
        graphemeLines.push(line);
        line = [];
        lineWidth = wordWidth;
        lineJustStarted = true;
      }
      if (!lineJustStarted) {
        line.push(infix);
      }
      line = line.concat(word);
      infixWidth = this._measureWord([infix], lineIndex, offset);
      offset++;
      lineJustStarted = false;
      if (wordWidth > largestWordWidth) {
        largestWordWidth = wordWidth;
      }
    }
    i && graphemeLines.push(line);
    if (
      largestWordWidth + this.getIndentSpace(lineIndex) >
      this.dynamicMinWidth
    ) {
      this.dynamicMinWidth =
        largestWordWidth - additionalSpace + this.getIndentSpace(lineIndex);
    }
    return graphemeLines;
  };
  fabric.Text.prototype.isListType = function () {
    if (this.listType && this.listType !== TextListType.NONE) return true;
    return false;
  };

  fabric.Text.prototype.calcTextWidth = function () {
    if (this.isListType()) {
      var maxWidth = this.getLineWidth(0);
      for (var i = 1, len = this._textLines.length; i < len; i++) {
        var currentLineWidth = this.getLineWidth(i) + this.getIndentSpace(i);
        if (currentLineWidth > maxWidth) {
          maxWidth = currentLineWidth;
        }
      }
      return maxWidth;
    } else {
      var maxWidth = this.getLineWidth(0);
      for (var i = 1, len = this._textLines.length; i < len; i++) {
        var currentLineWidth = this.getLineWidth(i);
        if (currentLineWidth > maxWidth) {
          maxWidth = currentLineWidth;
        }
      }
      return maxWidth;
    }
  };

  fabric.Text.prototype.initDimensions = function () {
    if (this.__skipDimension) {
      return;
    }
    this?._splitText();
    this._clearCache();

    if (this.listType && this.listType !== TextListType.NONE) {
      this.width =
        this.calcTextWidth() + this._getLineLeftOffset() ||
        this.cursorWidth ||
        MIN_TEXT_WIDTH;
      if (this.textAlign.indexOf("justify") !== -1) {
        this.enlargeSpaces();
      }
      this.height = this.calcTextHeight();
    } else {
      if (this.path) {
        this.width = this.path.width;
        this.height = this.path.height;
      } else {
        this.width =
          this.calcTextWidth() || this.cursorWidth || this.MIN_TEXT_WIDTH;
        this.height = this.calcTextHeight();
      }
      if (this.textAlign.indexOf("justify") !== -1) {
        // once text is measured we need to make space fatter to make justified text.
        this.enlargeSpaces();
      }
    }
    this.saveState({ propertySet: "_dimensionAffectingProps" });
  };
  fabric.IText.prototype._renderTextLine = function (
    method,
    ctx,
    line,
    left,
    top,
    lineIndex
  ) {
    if (this.listType && this.listType !== TextListType.NONE) {
      this.callSuper(
        "_renderTextLine",
        method,
        ctx,
        line,
        left,
        top,
        lineIndex
      );
      var bullet = " " + this.getBulletText(lineIndex);
      if (bullet) {
        var c = this.fontSize;
        top -= this.fontSize * this._fontSizeFraction;
        this._renderChar(
          method,
          ctx,
          lineIndex,
          0,
          bullet,
          left - this.fontSize,
          top
        );
      }
    } else {
      this._renderChars(method, ctx, line, left, top, lineIndex);
    }
  };
  fabric.Textbox.prototype.getIndentStyle = function (e, t) {
    var n = !t && this._styleMap ? this._styleMap[e].line : e,
      r = this.lineStyles[n];
    return this.listType;
    // return r ? r.indentStyle || 'bullet' : 'bullet';
  };

  fabric.Textbox.prototype.getNumbering = function (lineIndex, t) {
    this._styleMap[lineIndex].offset = 10;
    return this._styleMap[lineIndex].line + 1 + ". ";
  };

  fabric.Textbox.prototype.getBulletText = function (lindexIndex) {
    var t = this.isLineIndent(lindexIndex);
    if (!t) return "";
    var n = this.getIndentStyle(lindexIndex);
    if (
      0 !== lindexIndex &&
      this._styleMap[lindexIndex].line === this._styleMap[lindexIndex - 1].line
    )
      return "";
    switch (n) {
      case TextListType.NUMBER:
        return this.getNumbering(lindexIndex, t);
      case TextListType.BULLET:
        return (this.listBullet || "●") + " ";
      case TextListType.NONE:
      default:
        return "";
    }
  };
  fabric.Text.prototype.isLineIndent = function (line) {
    var lineIndex =
      this._styleMap && this._styleMap[line] ? this._styleMap[line].line : line;
    var lineStyles = this.lineStyles[lineIndex];
    return lineStyles ? lineStyles.indentLevel || 2 : 1;
  };

  fabric.Text.prototype.getIndentSpace = function (lineIndex, t) {
    if (!this.isListType()) return 0;
    return this.isLineIndent(lineIndex, t) * this.fontSize;
  };

  fabric.Textbox.prototype._getLineLeftOffset = function (lineIndex) {
    var indentSpace = this.getIndentSpace(lineIndex),
      lineWidth = this.getLineWidth(lineIndex) + indentSpace;
    return "center" === this.textAlign
      ? (this.width - lineWidth) / 2 + indentSpace
      : "right" === this.textAlign
      ? this.width - lineWidth + indentSpace
      : indentSpace;
  };

  // Add transformations effects to the textbox
  fabric.Text.prototype.drawText = function () {
    let cv;
    let line;
    switch (this.metadata?.textTransform?.type) {
      case SLIDER_TYPE.FLAGTEXT:
        const w = this.width;
        cv = this?.metadata?.textTransform?.value / 100;
        const fvv = (this.fontSize * 70) / 100;
        line = new fabric.Path(
          `M 0 0 C ${w / 6} ${0 + fvv * cv}, ${w / 3} ${0 + fvv * cv}, ${
            w / 2
          } 0 S ${w} ${0 - fvv * cv}, ${w} 0`,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 2,
          pathStartOffset: 0,
        });
        this.setCoords();
        break;
      case SLIDER_TYPE.CIRCULARTEXT:
        const radius = this?.metadata?.textTransform?.value / 90 + 0.2; // Normalize cv to a range of 0 to 1
        const cw = this.fontSize * 1.3;
        line = new fabric.Path(
          `M ${cw * radius}, ${cw * 2 * radius}
            a ${cw * radius},${cw * radius} 0 1,1 ${cw * 2 * radius},0
            a ${cw * radius},${cw * radius} 0 1,1 -${cw * 2 * radius},0
          `,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
        line.segmentsInfo = pathInfo;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 5,
          pathStartOffset: (-Math.PI * cw * radius) / 2,
        });
        this.setCoords();
        break;
      case SLIDER_TYPE.ANGLETEXT:
        cv = -this?.metadata?.textTransform?.value / 100; // Normalize cv to a range of 0 to 1
        const vo = (this.fontSize * 72) / 150;
        line = new fabric.Path(
          `M 0 ${0 - cv * vo} L ${this.width} ${0 + cv * vo}`,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
        line.segmentsInfo = pathInfo;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 2,
          pathStartOffset: 0,
        });
        this.setCoords();
        break;
      case SLIDER_TYPE.ARCHTEXT:
        cv = this?.metadata?.textTransform?.value / 25; // Normalize cv to a range of 0 to 1

        line = new fabric.Path(
          `M 0 0 Q ${this.width / 2} ${(-this.fontSize / 2) * cv} ${
            this.width
          } 0`,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
        line.segmentsInfo = pathInfo;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 2,
          pathStartOffset: 0,
        });
        this.setCoords();
        break;
      case SLIDER_TYPE.WAVETEXT:
        cv = this?.metadata?.textTransform?.value / 80; // Normalize cv to a range of 0 to 1
        let ww = this.width;
        let cy1 = (this.fontSize * 70) / 72;
        let cy2 = (this.fontSize * 75) / 72;
        let cy3 = (this.fontSize * 90) / 72;
        line = new fabric.Path(
          `M 0 0 C ${ww / 3} ${0 - cv * cy1}, ${ww / 2} ${0 - cv * cy2}, ${
            ww / 2
          } ${0 - cv * cy2} S ${(ww * 5) / 6} ${0 - cy3 * cv}, ${ww} ${
            0 - cy1 * cv
          } `,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
        line.segmentsInfo = pathInfo;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 3,
          pathStartOffset: 0,
        });
        this.setCoords();
        break;
      case SLIDER_TYPE.RISETEXT:
        cv = this?.metadata?.textTransform?.value / 80; // Normalize cv to a range of 0 to 1
        let WR = this.width;
        let rcy1 = (this.fontSize * 70) / 100;
        let rcy2 = (this.fontSize * 65) / 100;
        let rcy3 = (this.fontSize * 30) / 100;
        let rcy4 = (this.fontSize * 40) / 100;
        line = new fabric.Path(
          `M 0 ${0 + cv * rcy1} C ${WR / 6} ${0 + cv * rcy2}, ${WR / 3} ${
            0 + cv * rcy3
          }, ${WR / 2} ${0} S ${(WR * 4) / 6} ${0 - rcy3 * cv}, ${WR} ${
            0 - rcy4 * cv
          }`,
          {
            objectCaching: false,
            fill: "",
          }
        );

        this.line = line;

        var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
        line.segmentsInfo = pathInfo;

        this.set({
          path: line,
          textAlign: "center",
          pathAlign: "center",
          pathSide: "left",
          _fontSizeMult: 3,
          pathStartOffset: 0,
        });
        this.setCoords();
        break;
      default:
        break;
    }

    var pathInfo = fabric.util.getPathSegmentsInfo(line.path);
    line.segmentsInfo = pathInfo;
    var pathLength = pathInfo[pathInfo.length - 1].length - 20;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    let chars = [];
    let charsWidth = 0;

    for (let i = 0; i < this.metadata.os?.length; i++) {
      let char = this.metadata.os[i];

      char = char === " " || char === "\n" ? "\xa0" : char;

      const width = context.measureText(char).width;
      if (charsWidth < pathLength) {
        chars.push(char);
        // charsWidth = charsWidth + width + this.charSpacing / 25;
        if (this.metadata?.textTransform?.type === SLIDER_TYPE.CIRCULARTEXT) {
          charsWidth = charsWidth + width + this.charSpacing / 22;
        } else {
          charsWidth = charsWidth + width + this.charSpacing / 22;
        }
        continue;
      } else {
        break;
      }
    }

    // this._renderChars(method, ctx, chars, left, top, lineIndex);
    this.set({
      text: chars.join(""),
    });
  };

  fabric.Text.prototype.init = function (textObject, canvas) {
    if (textObject?.metadata?.textTransform?.value) {
      this.drawText();
    }
  };

  fabric.Text.prototype.render = function (ctx) {
    if (this?.clearContextTop) {
      this.clearContextTop();
    }

    // Hide the width controllers on text transform

    if (this?.metadata?.textTransform) {
      this.setControlsVisibility({ mr: false, ml: false });
    } else {
      this.setControlsVisibility({ mr: true, ml: true });
    }

    if (!this?.metadata?.textTransform || this?.isEditing) {
      this.set({
        path: null,
        _fontSizeMult: 1,
      });
      this.setCoords();
    } else {
      this.drawText();
    }

    if (this?.charSpacing > 10 && this?.metadata?.textTransform) {
      this.set({ textAlign: "left" });
    }

    // Add the underline handling
    if (this.underline && this?.metadata?.textTransform) {
      this.set({ pathAlign: "baseline" });
    } else if (!this.underline && this?.metadata?.textTransform) {
      this.set({ pathAlign: "center" });
    }

    // If there is a list type then remove the transformation

    if (
      this?.listType === TextListType.BULLET ||
      this?.listType === TextListType.NUMBER
    ) {
      this.set({ path: null });
      this.setCoords();
    }

    fabric.Object.prototype.render.call(this, ctx);
    this.cursorOffsetCache = {};

    if (this?.renderCursorOrSelection) {
      this.renderCursorOrSelection();
    }
  };

  /**
   * Fabric overrided function to add bullet points on svg export.
   */
  fabric.IText.prototype._setSVGTextLineText = function (
    textSpans,
    lineIndex,
    textLeftOffset,
    textTopOffset
  ) {
    // set proper line offset
    var lineHeight = this.getHeightOfLine(lineIndex),
      isJustify = this.textAlign.indexOf("justify") !== -1,
      actualStyle,
      nextStyle,
      charsToRender = "",
      charBox,
      style,
      boxWidth = 0,
      line = this._textLines[lineIndex],
      timeToRender;

    textTopOffset +=
      (lineHeight * (1 - this._fontSizeFraction)) / this.lineHeight;

    style = this._getStyleDeclaration(lineIndex, 0) || {};

    // custom code in the below if block
    // Functionality: if text is list type, then add bullet at the end
    if (this?.isListType()) {
      charBox = this.__charBounds[lineIndex][0];
      textSpans.push(
        this._createTextCharSpan(
          " " + this?.getBulletText?.(lineIndex),
          style,
          textLeftOffset - this.fontSize,
          textTopOffset,
          charBox
        )
      );
    }

    for (var i = 0, len = line.length - 1; i <= len; i++) {
      timeToRender = i === len || this.charSpacing || this.path;

      charsToRender += line[i];
      charBox = this.__charBounds[lineIndex][i];
      if (boxWidth === 0) {
        textLeftOffset += charBox.kernedWidth - charBox.width;
        boxWidth += charBox.width;
      } else {
        boxWidth += charBox.kernedWidth;
      }
      if (isJustify && !timeToRender) {
        if (this._reSpaceAndTab.test(line[i])) {
          timeToRender = true;
        }
      }
      if (!timeToRender) {
        actualStyle =
          actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
        nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
        timeToRender = fabric.util.hasStyleChanged(
          actualStyle,
          nextStyle,
          true
        );
      }
      if (timeToRender) {
        style = this._getStyleDeclaration(lineIndex, i) || {};

        textSpans.push(
          this._createTextCharSpan(
            charsToRender,
            style,
            textLeftOffset,
            textTopOffset,
            charBox
          )
        );
        charsToRender = "";
        actualStyle = nextStyle;
        if (this.direction === "rtl") {
          textLeftOffset -= boxWidth;
        } else {
          textLeftOffset += boxWidth;
        }
        boxWidth = 0;
      }
    }
  };

  // fabric.IText.prototype._renderChars = function (
  //   method: string,
  //   ctx: CanvasRenderingContext2D,
  //   line: string,
  //   left: number,
  //   top: number,
  //   lineIndex: number
  // ) {
  //   let l = line;
  //   if (this.path) {
  //     var pathInfo = fabric.util.getPathSegmentsInfo(this.path.path);
  //     line.segmentsInfo = pathInfo;
  //     var pathLength = pathInfo[pathInfo.length - 1].length - 20;

  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
  //     context.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
  //     let chars = [];
  //     let charsWidth = 0;

  //     for (let i = 0; i < this.text?.length; i++) {
  //       const char = this.text[i];
  //       const width = context.measureText(char).width;
  //       if (charsWidth < pathLength) {
  //         chars.push(char === '\n' ? ' ' : char);
  //         charsWidth = charsWidth + width + this.charSpacing / 100;
  //         continue;
  //       } else {
  //         break;
  //       }
  //     }
  //     console.log(chars.join(''), pathLength, charsWidth);
  //     l = chars.slice(0, 5);
  //   }

  //   this.callSuper('_renderChars', method, ctx, l, left, top, lineIndex);
  // };

  /**
   * Override fabric function with minor fix to support font family in svg export.
   */
  fabric.StaticCanvas.prototype.createSVGFontFacesMarkup = function () {
    var markup = "",
      fontList = {},
      obj,
      fontFamily,
      style,
      row,
      rowIndex,
      _char,
      charIndex,
      i,
      len,
      fontPaths = fabric.fontPaths,
      objects = [];

    this._objects.forEach(function add(object) {
      objects.push(object);
      if (object._objects) {
        object._objects.forEach(add);
      }
    });

    for (i = 0, len = objects.length; i < len; i++) {
      obj = objects[i];
      fontFamily = obj.fontFamily;

      // custom code: in below if condition, obj.type.indexOf('text') us removed
      if (fontList[fontFamily] || !fontPaths[fontFamily]) {
        continue;
      }
      fontList[fontFamily] = true;
      if (!obj.styles) {
        continue;
      }
      style = obj.styles;
      for (rowIndex in style) {
        row = style[rowIndex];
        for (charIndex in row) {
          _char = row[charIndex];
          fontFamily = _char.fontFamily;
          if (!fontList[fontFamily] && fontPaths[fontFamily]) {
            fontList[fontFamily] = true;
          }
        }
      }
    }

    for (var j in fontList) {
      markup += [
        "\t\t@font-face {\n",
        "\t\t\tfont-family: '",
        j,
        "';\n",
        "\t\t\tsrc: url('",
        fontPaths[j],
        "');\n",
        "\t\t}\n",
      ].join("");
    }

    if (markup) {
      markup = [
        '\t<style type="text/css">',
        "<![CDATA[\n",
        markup,
        "]]>",
        "</style>\n",
      ].join("");
    }

    return markup;
  };
})();

// Fabric utils functions and renderer classes

const createColorMapFromObjectColors = (
  objectColorsJson,
  objectColorsOriginal
) => {
  const colorMap = {};
  Object.keys(objectColorsOriginal).forEach((key, keyIdx) => {
    // loop through objects
    if (key === "[object Object]") {
      // gradient objects
      objectColorsOriginal[key].forEach((object, objectIdx) => {
        const originalFill = object.fill;

        if (originalFill instanceof fabric.Gradient) {
          originalFill.colorStops?.forEach((colorStop, colorStopIdx) => {
            const originalColor = colorStop.color;
            const customizedFill =
              Object.values(objectColorsJson)[keyIdx][objectIdx].fill;

            if (customizedFill && typeof customizedFill === "object") {
              const customizedColor =
                // @ts-ignore
                customizedFill?.colorStops?.[colorStopIdx]?.color;
              if (customizedColor) {
                colorMap[originalColor] = customizedColor;
              }
            }
          });
        }
      });
    } else {
      // solid color objects

      objectColorsOriginal[key].forEach((object, objectIdx) => {
        const originalFill = object.fill;

        const customizedFill =
          Object.values(objectColorsJson)[keyIdx][objectIdx].fill;
        if (typeof customizedFill === "string") {
          colorMap[originalFill] = customizedFill;
        }
      });
    }
  });
  return colorMap;
};

const degreesToRadians = fabric.util.degreesToRadians;

// @ts-ignore
function renderCropCorner(ctx, left, top, styleOverride, fabricObject) {
  // @ts-ignore
  if (!this.getVisibility(fabricObject)) {
    return;
  }
  const cSize = 14;
  ctx.save();
  ctx.translate(left, top);
  // @ts-ignore
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#fff";
  ctx.moveTo(0, cSize);
  ctx.lineTo(0, 0);
  ctx.lineTo(cSize, 0);
  ctx.stroke();
  ctx.restore();
}

export const getGroupObjectPositionPointRelativeToCanvas = (objectInGroup) => {
  const point = new fabric.Point(objectInGroup.left, objectInGroup.top);

  // in case object is not in the group but in the canvas itself, we return it's position.
  if (!objectInGroup.group) return point;

  const pointOnCanvas = fabric.util.transformPoint(
    point,
    objectInGroup.group.calcTransformMatrix()
  );

  return pointOnCanvas;
};

// @ts-ignore
function renderCropMiddle(ctx, left, top, styleOverride, fabricObject) {
  // @ts-ignore
  this.visibility = true;
  // @ts-ignore
  if (!this.getVisibility(fabricObject) || fabricObject.clippingPath) {
    // @ts-ignore
    this.visibility = false;
    return;
  }
  const cSize = 15;
  const cSizeBy2 = cSize / 2;
  ctx.save();
  ctx.translate(left, top);
  // @ts-ignore
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#fff";
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();
  ctx.restore();
}
// @ts-ignore
function renderCropMiddleForArtboard(
  ctx,
  left,
  top,
  styleOverride,
  fabricObject
) {
  // @ts-ignore
  this.visibility = true;
  // @ts-ignore
  if (!this.getVisibility(fabricObject) || fabricObject.clippingPath) {
    // @ts-ignore
    this.visibility = false;
    return;
  }
  const cSize = 30;
  const cSizeBy2 = cSize / 2;
  ctx.save();
  ctx.translate(left, top);
  // @ts-ignore
  ctx.rotate(degreesToRadians(this.angle + fabricObject.angle));
  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#296EF3";
  ctx.moveTo(-cSizeBy2, 0);
  ctx.lineTo(cSizeBy2, 0);
  ctx.stroke();
  ctx.restore();
}

function renderWithShadows(x, y, fn) {
  // @ts-ignore
  return function (ctx, left, top, styleOverride, fabricObject) {
    ctx.save();
    ctx.shadowColor = "rgba(12, 18, 28, 0.38)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = x;
    ctx.shadowOffsetY = y;
    // @ts-ignore
    fn.call(this, ctx, left, top, styleOverride, fabricObject);
    ctx.restore();
  };
}

export {
  renderCropCorner,
  renderCropMiddle,
  renderWithShadows,
  renderCropMiddleForArtboard,
};

const renderCropTL = renderWithShadows(2, 2, renderCropCorner);
const renderCropTR = renderWithShadows(-2, 2, renderCropCorner);
const renderCropBL = renderWithShadows(2, -2, renderCropCorner);
const renderCropBR = renderWithShadows(-2, -2, renderCropCorner);
const renderCropMT = renderWithShadows(0, 2, renderCropMiddle);
const renderCropMB = renderWithShadows(0, -2, renderCropMiddle);
const renderCropML = renderWithShadows(2, 0, renderCropMiddle);
const renderCropMR = renderWithShadows(-2, 0, renderCropMiddle);
const renderCropMTForArtboard = renderWithShadows(
  0,
  2,
  renderCropMiddleForArtboard
);
const renderCropMBForArtboard = renderWithShadows(
  0,
  -2,
  renderCropMiddleForArtboard
);
const renderCropMLForArtboard = renderWithShadows(
  2,
  0,
  renderCropMiddleForArtboard
);
const renderCropMRForArtboard = renderWithShadows(
  -2,
  0,
  renderCropMiddleForArtboard
);

export const getCustomCroppingControlsForArtboard = (oldControls) => {
  // Here handling the controller offset so it fits on the edge in such a way that it seems center align
  return {
    ml: new fabric.Control({
      ...oldControls.ml,
      offsetX: -1,
      render: renderCropMLForArtboard,
      angle: 90,
    }),
    mr: new fabric.Control({
      ...oldControls.mr,
      render: renderCropMRForArtboard,
      angle: 90,
      offsetX: 1,
    }),
    mb: new fabric.Control({
      ...oldControls.mb,
      render: renderCropMBForArtboard,
      offsetY: 1,
    }),
    mt: new fabric.Control({
      ...oldControls.mt,
      render: renderCropMTForArtboard,
      offsetY: -1,
    }),
    tl: new fabric.Control({ ...oldControls.tl }),
    tr: new fabric.Control({
      ...oldControls.tr,
    }),
    bl: new fabric.Control({
      ...oldControls.bl,
    }),
    br: new fabric.Control({
      ...oldControls.br,
    }),
  };
};

export const getMaskObjectIdFromMaskChildren = (id) => {
  return id?.substring(id?.indexOf("-") + 1);
};

export const handleRadius2 = (
  currentRadius = 0,
  currentStrokeWidth = 0,
  canvas,
  oldActiveObject,
  newActiveObject,
  strokeColor,
  skipEventHandlers
) => {
  if (
    !canvas ||
    oldActiveObject?.type === LayerType.STATIC_TEXT ||
    oldActiveObject?.type === LayerType.TEXT ||
    currentRadius === 0
  )
    return;
  currentRadius = +currentRadius;
  currentStrokeWidth = +currentStrokeWidth;
  oldActiveObject.set({
    top: oldActiveObject.getCenterPoint().y,
    left: oldActiveObject.getCenterPoint().x,
    originX: "center",
    originY: "center",
  });
  const target = canvas._objects.find(
    (el) => el.name === `radiusOuter-${oldActiveObject?.id}`
  );
  if (target) {
    canvas.remove(target);
  }

  newActiveObject?.off(
    "scaling",
    newActiveObject?.eventHandlerRefs?.outlineHandlers?.scaling
  );
  newActiveObject?.off(
    "rotating",
    newActiveObject?.eventHandlerRefs?.outlineHandlers?.rotating
  );
  newActiveObject?.off(
    "moving",
    newActiveObject?.eventHandlerRefs?.outlineHandlers?.moving
  );

  var rect = new fabric.Rect({
    left: oldActiveObject?.left,
    top: oldActiveObject?.top,
    rx: currentRadius === 0 ? 0 : currentRadius,
    ry: currentRadius === 0 ? 0 : currentRadius,
    width: oldActiveObject?.getScaledWidth() - currentStrokeWidth,
    height: oldActiveObject?.getScaledHeight() - currentStrokeWidth,
    fill: "#000000",
    absolutePositioned: true,
    angle: oldActiveObject?.angle,
    originX: oldActiveObject?.originX,
    originY: oldActiveObject?.originY,
    // @ts-ignore
    name: `radiusMask-${newActiveObject?.id}`,
    // @ts-ignore
    id: `radiusMask-${newActiveObject?.id}`,
    strokeUniform: false,
    stroke: "#000000",
    strokeWidth: 100,
    objectCaching: false,
    selectable: true,
    evented: true,
  });

  var outerRect;

  if (
    (currentStrokeWidth && currentStrokeWidth > 0) ||
    (currentRadius && currentRadius > 0)
  ) {
    outerRect = new fabric.Rect({
      left: oldActiveObject?.left,
      top: oldActiveObject?.top,
      rx: currentRadius === 0 ? 0 : currentRadius,
      ry: currentRadius === 0 ? 0 : currentRadius,
      width: oldActiveObject?.getScaledWidth() - currentStrokeWidth,
      height: oldActiveObject?.getScaledHeight() - currentStrokeWidth,
      originX: oldActiveObject?.originX,
      originY: oldActiveObject?.originY,
      stroke: strokeColor,
      name: `radiusOuter-${newActiveObject?.id}`,
      // @ts-ignore
      id: `radiusOuter-${newActiveObject?.id}`,
      strokeWidth: currentStrokeWidth,
      selectable: false,
      evented: false,
      fill: "transparent",
      objectCaching: false,
      angle: oldActiveObject?.angle,
      opacity:
        oldActiveObject?.opacity !== undefined ? oldActiveObject?.opacity : 1,
      strokeUniform: false,
      // clipPath: rect,
    });
  }

  canvas.renderAll();
  if (currentRadius > 0) {
    newActiveObject?.set("clipPath", rect);

    //add frameId to outerRect
    const frameId = newActiveObject?.metadata?.frameId;
    if (frameId) {
      outerRect.metadata = {
        ...outerRect.metadata,
        frameId,
      };
    }
  }

  if (!skipEventHandlers) {
    newActiveObject.eventHandlerRefs = {
      ...newActiveObject.eventHandlerRefs,
      outlineHandlers: {
        scaling: () =>
          handleScale(rect, outerRect, currentStrokeWidth, newActiveObject),
        rotating: ({ transform }) =>
          handleTransform(rect, outerRect, transform, newActiveObject),
        moving: () => handleMove(rect, outerRect, newActiveObject),
      },
    };

    newActiveObject?.on(
      "scaling",
      newActiveObject.eventHandlerRefs.outlineHandlers.scaling
    );

    newActiveObject?.on(
      "rotating",
      newActiveObject.eventHandlerRefs.outlineHandlers.rotating
    );

    newActiveObject?.on(
      "moving",
      newActiveObject.eventHandlerRefs.outlineHandlers.moving
    );
  }

  newActiveObject.set({
    metadata: {
      ...oldActiveObject?.metadata,
      currentStrokeWidth,
      currentRadius: currentRadius,
      stroke: strokeColor,
    },
  });

  canvas.requestRenderAll();
  return outerRect;
};

export function loadImageFromURL(src) {
  return new Promise(async (resolve, reject) => {
    try {
      // First download the image using fetch
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the image as an array buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use sharp to process the image and convert to PNG
      const imageBuffer = await sharp(buffer).png().toBuffer();

      // Create a canvas and load the image
      const { createCanvas, loadImage } = await import("canvas");
      const canvas = createCanvas(1, 1);
      const image = await loadImage(imageBuffer);

      resolve(image);
    } catch (error) {
      console.log("Failed to load image with sharp:", error.message);
      reject(error);
    }
  });
}

// Add font loading functionality
export async function loadFont(fontURL, fontFamily) {
  try {
    const { registerFont } = await import("canvas");

    const response = await fetch(fontURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const fs = await import("fs");
    const path = await import("path");

    let fileExtension = ".ttf";
    if (fontURL.includes(".woff2")) fileExtension = ".woff2";
    else if (fontURL.includes(".woff")) fileExtension = ".woff";
    else if (fontURL.includes(".otf")) fileExtension = ".otf";

    const tempFontPath = path.default.join(
      process.cwd(),
      `temp_${fontFamily}_${Date.now()}${fileExtension}`
    );

    fs.default.writeFileSync(tempFontPath, Buffer.from(buffer));

    registerFont(tempFontPath, { family: fontFamily });

    setTimeout(() => {
      try {
        fs.default.unlinkSync(tempFontPath);
      } catch (e) {
        console.log("Error while cleaning up font", e);
      }
    }, 10000);

    console.log(`Font ${fontFamily} loaded successfully from ${fontURL}`);
    return fontFamily;
  } catch (error) {
    console.log(`Failed to load font ${fontFamily}:`, error.message);
    throw error;
  }
}

export const offMovementEventListeners = (object) => {
  // @ts-ignore
  object?.off("scaling", object?.eventHandlerRefs?.outlineHandlers?.scaling);
  // @ts-ignore
  object?.off("rotating", object?.eventHandlerRefs?.outlineHandlers?.rotating);
  // @ts-ignore
  object?.off("moving", object?.eventHandlerRefs?.outlineHandlers?.moving);
};

export const handleScale = (
  rect,
  outerRect,
  currentStrokeWidth,
  newActiveObject
) => {
  if (newActiveObject?.type === LayerType.MASK) {
    return;
  } else {
    rect.set({
      width: newActiveObject?.getScaledWidth() - currentStrokeWidth,
      height: newActiveObject?.getScaledHeight() - currentStrokeWidth,
    });
    rect.setPositionByOrigin(
      newActiveObject?.getCenterPoint(),
      "center",
      "center"
    );
  }
  if (outerRect) {
    outerRect.set({
      width: newActiveObject?.getScaledWidth() - currentStrokeWidth,
      height: newActiveObject?.getScaledHeight() - currentStrokeWidth,
      originX: "center",
      originY: "center",
    });
    outerRect.setPositionByOrigin(
      newActiveObject?.getCenterPoint(),
      "center",
      "center"
    );
  }
  // newActiveObject?.set('clipPath', rect);
};

export const handleTransform = (
  rect,
  outerRect,
  transform,
  newActiveObject
) => {
  if (newActiveObject?.type === LayerType.MASK) {
    return;
  } else {
    rect.set({
      angle: transform.target.angle,
      top: newActiveObject?.top,
      left: newActiveObject?.left,
    });

    if (outerRect) {
      outerRect.set({
        angle: transform.target.angle,
        top: newActiveObject?.top,
        left: newActiveObject?.left,
      });
    }
  }
};

export const handleMove = (rect, outerRect, newActiveObject) => {
  if (newActiveObject?.type === LayerType.MASK) {
    return;
  } else {
    rect.set({ left: newActiveObject?.left, top: newActiveObject?.top });
    if (outerRect) {
      outerRect.set({ left: newActiveObject?.left, top: newActiveObject?.top });
    }
  }
};

const addMovementEventHandlingToClipPath = ({ object, clipPath }) => {
  // @ts-ignore
  object.eventHandlerRefs = {
    // @ts-ignore
    ...object.eventHandlerRefs,
    outlineHandlers: {
      scaling: () => handleScale(clipPath, null, 0, object),
      rotating: ({ transform }) =>
        handleTransform(clipPath, null, transform, object),
      moving: () => handleMove(clipPath, null, object),
    },
  };

  // @ts-ignore
  object?.on("scaling", object.eventHandlerRefs.outlineHandlers.scaling);

  // @ts-ignore
  object?.on("rotating", object.eventHandlerRefs.outlineHandlers.rotating);

  // @ts-ignore
  object?.on("moving", object.eventHandlerRefs.outlineHandlers.moving);
};

export const handleMaskClipPath = ({
  maskObject,
  clipPath,
  firstTime = false,
}) => {
  if (maskObject?.type !== LayerType.MASK) {
    console.log("INVALID MASK");
    return;
  }
  if (!clipPath) {
    console.log("CLIP PATH NOT FOUND FOR MASK LAYER. SERIOUS ISSUE");
    return;
  }

  // Update the clipPath position based on the offset
  clipPath.set({
    objectCaching: false,
    // top: (clipPath?.top ?? 0) + offsetY,
    // left: (clipPath?.left ?? 0) + offsetX,
    opacity:
      // @ts-ignore
      maskObject?.maskFillOpacity >= 0.01 ? maskObject?.maskFillOpacity : 0.001,
    // @ts-ignore
    fill: maskObject?.maskFill ?? "#FFFFFF",
    originX: "center",
    originY: "center",
  });
  if (firstTime) {
    // @ts-ignore
    clipPath.initialOffset = { x: 0, y: 0 };
    clipPath.set({
      top: maskObject?.top,
      left: maskObject?.left,
      scaleX: maskObject?.getScaledWidth() / (clipPath.width ?? 1),
      scaleY: maskObject?.getScaledHeight() / (clipPath.height ?? 1),
    });

    maskObject?.setCoords();
  } else {
    // Calculate the offset from the original position
    const offsetX = (maskObject?.left ?? 0) - (clipPath?.left ?? 0);
    const offsetY = (maskObject?.top ?? 0) - (clipPath?.top ?? 0);

    // Store the initial relative offset when movement starts
    // @ts-ignore
    if (!clipPath.initialOffset) {
      // @ts-ignore
      clipPath.initialOffset = { x: offsetX, y: offsetY };
    }
    clipPath.set({
      // left: maskObject.left - clipPath.initialOffset.x,
      // top: maskObject.top - clipPath.initialOffset.y,
    });
  }

  offMovementEventListeners(maskObject);

  maskObject?.set("clipPath", clipPath);
  maskObject?.set("objectCaching", false);
  maskObject?.set("dirty", true);
  maskObject?.setCoords();

  addMovementEventHandlingToClipPath({
    object: maskObject,
    clipPath,
  });
};

export const getConvoluteFilter = (type) => {
  switch (type) {
    case "None":
      return [];
    case "Polaroid":
      // @ts-ignore
      const pl = new fabric.Image.filters.Polaroid();
      return [pl];

    case "Sepia":
      const sp = new fabric.Image.filters.Sepia();
      return [sp];

    case "Kodachrome":
      // @ts-ignore
      const kd = new fabric.Image.filters.Kodachrome();
      return [kd];

    case "Greyscale":
      // @ts-ignore
      const g = new fabric.Image.filters.Grayscale();
      return [g];

    case "Brownie":
      // @ts-ignore
      const br = new fabric.Image.filters.Brownie();
      return [br];

    case "Vintage":
      // @ts-ignore
      const vn = new fabric.Image.filters.Vintage();
      return [vn];

    case "Technicolor":
      // @ts-ignore
      const tc = new fabric.Image.filters.Technicolor();
      return [tc];

    case "Invert":
      // @ts-ignore
      const inv = new fabric.Image.filters.Invert({ name: "darshan" });
      return [inv];

    case "Sharpen":
      // @ts-ignore
      const sharpen = new fabric.Image.filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      });
      return [sharpen];

    case "Emboss":
      // @ts-ignore
      const emb = new fabric.Image.filters.Convolute({
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
      });
      return [emb];

    case "RemoveColor":
      // @ts-ignore
      var rm = new fabric.Image.filters.RemoveColor({
        threshold: 0.2,
        distance: 0.5,
      });
      return [rm];

    case "BlacknWhite":
      // @ts-ignore
      var bw = new fabric.Image.filters.BlackWhite();
      return [bw];

    case "Gamma":
      // @ts-ignore
      const gamma = new fabric.Image.filters.Gamma({
        gamma: [1, 0.5, 2.1],
      });
      return [gamma];

    default:
      return [];
  }
};

export const IsFilterPresentInGivenFiltersObj = (filters, type) => {
  if (filters) {
    let index = -1;
    filters?.map((each, idx) => {
      if (filters[idx]?.type === type) {
        index = idx;
      }
    });
    return index;
  } else {
    return -1;
  }
};

export function updateObjectFilters(object, options) {
  if (options && options.length > 0) {
    const updatedFiltersArr = [];
    const types = [
      SLIDER_TYPE.BRIGHTNESS,
      SLIDER_TYPE.BLUR,
      SLIDER_TYPE.CONTRAST,
      SLIDER_TYPE.SATURATION,
      SLIDER_TYPE.HUE,
      SLIDER_TYPE.OPACITY,
      SLIDER_TYPE.LOWLIGHT,
      SLIDER_TYPE.HIGHLIGHT,
      SLIDER_TYPE.TEMPERATURE,
      SLIDER_TYPE.VIBRANCE,
      SLIDER_TYPE.PIXELATE,
      SLIDER_TYPE.NOISE,
      SLIDER_TYPE.POLAROID,
      SLIDER_TYPE.SEPIA,
      SLIDER_TYPE.KODACHROME,
      SLIDER_TYPE.GRAYSCALE,
      SLIDER_TYPE.BROWNIE,
      SLIDER_TYPE.VINTAGE,
      SLIDER_TYPE.TECHNICOLOR,
      SLIDER_TYPE.INVERT,
      SLIDER_TYPE.SHARPEN,
      SLIDER_TYPE.EMBOSS,
      SLIDER_TYPE.REMOVECOLOR,
      SLIDER_TYPE.BLACKNWHITE,
      SLIDER_TYPE.GAMMA,
      SLIDER_TYPE.BLENDCOLOR,
    ];
    types.forEach((type) => {
      if (type === SLIDER_TYPE.BRIGHTNESS) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Brightness");
        if (index != -1) {
          const filter = new fabric.Image.filters.Brightness({
            brightness: options[index].brightness,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.BLUR) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Blur");
        if (index != -1) {
          const filter = new fabric.Image.filters.Blur({
            blur: options[index].blur,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        } else {
        }
      } else if (type === SLIDER_TYPE.CONTRAST) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Contrast");
        if (index != -1) {
          const filter = new fabric.Image.filters.Contrast({
            contrast: options[index].contrast,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.SATURATION) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Saturation");

        if (index != -1) {
          const filter = new fabric.Image.filters.Saturation({
            saturation: options[index].saturation,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.HUE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "HueRotation");
        if (index != -1) {
          const filter = new fabric.Image.filters.HueRotation({
            rotation: options[index].rotation,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.HIGHLIGHT) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Highlight");
        if (index != -1) {
          const filter = new fabric.Image.filters.Highlight({
            highlight: options[index].highlight,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.LOWLIGHT) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Lowlight");
        if (index != -1) {
          const filter = new fabric.Image.filters.Lowlight({
            lowlight: options[index].lowlight,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.TEMPERATURE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Temperature");

        if (index != -1) {
          const filter = new fabric.Image.filters.Temperature({
            temperature: options[index].temperature,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.VIBRANCE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Vibrance");
        if (index != -1) {
          // @ts-ignore
          const filter = new fabric.Image.filters.Vibrance({
            vibrance: options[index].vibrance,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.PIXELATE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Pixelate");
        if (index != -1) {
          const filter = new fabric.Image.filters.Pixelate({
            // @ts-ignore
            blocksize: parseInt(options[index].blocksize),
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.NOISE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Noise");

        if (index != -1) {
          const filter = new fabric.Image.filters.Noise({
            noise: options[index].noise,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.POLAROID) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Polaroid");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Polaroid");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.SEPIA) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Sepia");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Sepia");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.KODACHROME) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Kodachrome");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Kodachrome");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.GRAYSCALE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Grayscale");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Grayscale");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.BROWNIE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Brownie");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Brownie");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.VINTAGE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Vintage");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Vintage");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.TECHNICOLOR) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Technicolor");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Technicolor");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.INVERT) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Invert");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Invert");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.SHARPEN) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Convolute");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Sharpen");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.EMBOSS) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Convolute");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Emboss");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.REMOVECOLOR) {
        let index = IsFilterPresentInGivenFiltersObj(options, "RemoveColor");
        if (index != -1) {
          const [filter] = getConvoluteFilter("RemoveColor");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.BLACKNWHITE) {
        let index = IsFilterPresentInGivenFiltersObj(options, "BlackWhite");
        if (index != -1) {
          const [filter] = getConvoluteFilter("BlacknWhite");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.GAMMA) {
        let index = IsFilterPresentInGivenFiltersObj(options, "Gamma");
        if (index != -1) {
          const [filter] = getConvoluteFilter("Gamma");
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      } else if (type === SLIDER_TYPE.BLENDCOLOR) {
        let index = IsFilterPresentInGivenFiltersObj(options, "BlendColor");
        if (index != -1) {
          const filter = new fabric.Image.filters.BlendColor({
            color: options[index].color,
            mode: options[index].mode,
            alpha: options[index].alpha,
          });
          updatedFiltersArr.push(filter);
          object.set("filters", updatedFiltersArr);
        }
      }
    });
  } else {
    object.set({
      filters: [],
    });
  }
  object?.applyFilters();
}

export const adjustFilterBackend = (activeObject) => {
  if (activeObject && activeObject?.getOriginalSize) {
    const { height, width } = activeObject?.getOriginalSize();

    const maxDimension = height > width ? height : width;

    if (fabric.filterBackend instanceof fabric.Canvas2dFilterBackend) {
      if (maxDimension <= fabric.maxTextureSize) {
        fabric.filterBackend = new fabric.WebglFilterBackend({
          tileSize: maxDimension,
        });
      }
    } else if (fabric.filterBackend instanceof fabric.WebglFilterBackend) {
      // No need to change the filter backend
      if (fabric.filterBackend.tileSize >= maxDimension) return;

      if (fabric.filterBackend.tileSize <= fabric.maxTextureSize) {
        fabric.filterBackend = new fabric.WebglFilterBackend({
          tileSize: maxDimension,
        });
      } else {
        // Fallback to Canvas2d
        fabric.filterBackend = new fabric.initFilterBackend();
      }
    }
  }
};

export function updateObjectShadow(object, options) {
  if (options) {
    object.set({
      shadow: new fabric.Shadow(options),
    });
  } else {
    object.set({
      shadow: null,
    });
  }
}

export class ObjectImporterRenderer {
  async import(item, canvas, params, isInGroup = false) {
    let object;
    switch (item.type) {
      case LayerType.STATIC_TEXT:
        object = await this.staticText(item);
        break;
      case LayerType.TEXT:
        object = await this.text(item);
        break;
      case LayerType.STATIC_IMAGE:
        object = await this.staticImage(item, canvas);
        break;
      case LayerType.BACKGROUND_IMAGE:
        object = await this.backgroundImage(item);
        break;
      case LayerType.STATIC_VIDEO:
        object = await this.staticVideo(item);
        break;
      case LayerType.STATIC_VECTOR:
        object = await this.staticVector(item, canvas);
        break;
      case LayerType.STATIC_PATH:
        object = await this.staticPath(item);
        break;
      case LayerType.BACKGROUND:
        object = await this.background(item);
        break;
      case "group":
        object = await this.group(item, canvas);
        break;

      case LayerType.MASK:
        object = await this.mask(item, canvas);
        break;
      case LayerType.ARTBOARD:
        object = await this.artboard(item);
        break;

      default:
        object = await new Promise((resolve) => {
          let updatedItem = {
            ...item,
            clipPath: null,
          };
          // @ts-ignore
          fabric.util.enlivenObjects([updatedItem], (objects) => {
            if (
              objects[0].eraser &&
              !(objects[0].eraser instanceof fabric.Object)
            ) {
              // @ts-ignore
              fabric.util.enlivenObjects(
                [objects[0].eraser],
                (eraserObjects) => {
                  objects[0].eraser = eraserObjects[0];
                }
              );
            }
            resolve(objects[0]);
          });
        });

        break;
    }
    return object;
  }

  mask(item, canvas) {
    return new Promise(async (resolve) => {
      try {
        item.clipPath = item.clipPath ?? {};
        // if (item?.clipPath?.type === LayerType.STATIC_VECTOR) {
        item.clipPath.src = item.maskSvgUrl;
        item.clipPath.preview = item.maskSvgUrl;
        // }
        const eraser = item?.eraser || null;

        const {
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          metadata,
        } = item?.clipPath;
        const objects = await new Promise((resolve) => {
          (item?.maskSvgUrl?.startsWith("http")
            ? fabric.loadSVGFromURL
            : fabric.loadSVGFromString)(item?.maskSvgUrl, (objects, opts) => {
            resolve(objects);
          });
        });

        const maskFill = item?.maskFill;
        const maskFillOpacity = item?.maskFillOpacity;
        const isDummy = item?.isDummy;

        const clipPath = new fabric.Group(objects, {
          scaleX: item?.clipPath?.scaleX,
          scaleY: item?.clipPath?.scaleY,
          name: item?.clipPath?.name,
          id: item?.clipPath?.id,
          preview: item?.clipPath?.preview,
          src: item?.clipPath?.src,
          originX: item?.clipPath?.originX,
          originY: item?.clipPath?.originY,
          top: item?.clipPath?.top,
          left: item?.clipPath?.left,
          flipX: item?.clipPath?.flipX,
          flipY: item?.clipPath?.flipY,
          angle: item?.clipPath?.angle,
          visible: item?.visible,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          metadata,
          hasControls,
          editable,
          absolutePositioned: true,
          dirty: true,
          objectCaching: false,
          selectable: false,
        });

        updateObjectShadow(clipPath, item?.clipPath?.shadow);
        const maskObject = (await new Promise())<fabric.Image>((resolve) => {
          fabric.Image.fromURL(
            item?.src ?? item?.preview,
            (img) => {
              // TODO: handle error handling
              resolve(img);
            },
            {
              crossOrigin: "anonymous",
            }
          );
        });

        maskObject?.set({
          ...item,
          clipPath: clipPath,
          src: item?.src,
          preview: item?.preview,
          maskSvgUrl: item?.maskSvgUrl,
          isDummy: item?.isDummy,
          top: item?.top,
          left: item?.left,
          scaleX: item?.scaleX,
          scaleY: item?.scaleY,
          originX: item?.originX,
          originY: item?.originY,
          cropX: item?.cropX ?? 0,
          cropY: item?.cropY ?? 0,
          flipX: item?.flipX,
          flipY: item?.flipY,
          angle: item?.angle,
        });
        if (isDummy) {
          if (maskFill && maskFillOpacity >= 0.01) {
            maskObject.filters = [
              new fabric.Image.filters.BlendColor({
                color: maskFill,
                mode: "tint",
                alpha: maskFillOpacity ?? 0.001,
              }),
            ];
            maskObject?.applyFilters();
          }
        } else {
          maskObject?.clipPath?._objects?.forEach((o) => {
            o.set("fill", maskFill || "#FFFFFF");
          });
          maskObject?.clipPath?.set("opacity", maskFillOpacity ?? 0.0001);
        }
        if (eraser && !(eraser instanceof fabric.Object)) {
          // @ts-ignore
          fabric.util.enlivenObjects([eraser], (objects) => {
            // @ts-ignore
            maskObject.eraser = objects[0];
          });
        }
        maskObject?.setCoords();

        if (
          !isDummy &&
          Array.isArray(item?.filters) &&
          item?.filters?.length > 0
        ) {
          maskObject.filters = item?.filters;
          maskObject.applyFilters();
          adjustFilterBackend(maskObject);

          updateObjectFilters(maskObject, item?.filters);
        }

        if (!maskObject) return resolve(null);

        handleMaskClipPath({
          maskObject,
          // @ts-ignore
          clipPath: maskObject.clipPath,
        });
        // @ts-ignore
        resolve([clipPath, maskObject]);

        return;
      } catch (err) {
        console.log("Error while importing mask layer", err);
        resolve(null);
      }
    });
  }

  // @ts-ignore
  staticText(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        const metadata = item.metadata;
        const {
          textAlign,
          fontFamily,
          fontURL,
          fontSize,
          charSpacing,
          lineHeight,
          text,
          underline,
          fill,
          eraser,
          clipPath,
          backgroundColor,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          listType,
          listBullet,
        } = item;

        let finalFontFamily = fontFamily;
        if (fontURL && fontFamily) {
          // Check if font is already loaded in cache
          if (!isFontLoaded(fontFamily, fontURL)) {
            try {
              await loadFont(fontURL, fontFamily);
              finalFontFamily = fontFamily;
            } catch (fontError) {
              console.log(
                `Font loading failed for ${fontFamily}, using fallback:`,
                fontError.message
              );
              if (fontFamily.toLowerCase().includes("serif")) {
                finalFontFamily = "Times New Roman";
              } else if (fontFamily.toLowerCase().includes("mono")) {
                finalFontFamily = "Courier New";
              } else {
                finalFontFamily = "Arial";
              }
            }
          } else {
            // Font already loaded, use it directly
            finalFontFamily = fontFamily;
          }
        }

        const textOptions = {
          ...baseOptions,
          underline,
          width: baseOptions.width ? baseOptions.width : 240,
          text: text ? text : " ",
          fill: fill ? fill : "#333333",
          ...(textAlign && { textAlign }),
          ...(finalFontFamily && { fontFamily: finalFontFamily }),
          ...(fontSize && { fontSize }),
          ...(charSpacing && { charSpacing }),
          ...(lineHeight && { lineHeight }),
          metadata,
          ...(textAlign && { textAlign }),
          ...(finalFontFamily && { fontFamily: finalFontFamily }),
          ...(fontURL && { fontURL }),
          ...(fontSize && { fontSize }),
          ...(charSpacing && { charSpacing }),
          ...(lineHeight && { lineHeight }),
          backgroundColor: backgroundColor || null,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          listType,
          listBullet,
        };
        // @ts-ignore
        const element = new fabric.StaticText(textOptions);

        if (eraser && !(eraser instanceof fabric.Object)) {
          // @ts-ignore
          fabric.util.enlivenObjects([eraser], (objects) => {
            element.eraser = objects[0];
          });
        }
        updateObjectShadow(element, item.shadow);

        resolve(element);
      } catch (err) {
        console.log("Failed to load staticText", err);
        resolve(null);
      }
    });
  }

  // @ts-ignore
  text(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        const metadata = item.metadata;
        const {
          textAlign,
          fontFamily,
          fontURL,
          fontSize,
          charSpacing,
          lineHeight,
          text,
          underline,
          fill,
          eraser,
          clipPath,
          backgroundColor,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          listType,
          listBullet,
        } = item;

        let finalFontFamily = fontFamily;
        if (fontURL && fontFamily) {
          // Check if font is already loaded in cache
          if (!isFontLoaded(fontFamily, fontURL)) {
            try {
              await loadFont(fontURL, fontFamily);
              finalFontFamily = fontFamily;
            } catch (fontError) {
              console.log(
                `Font loading failed for ${fontFamily}, using fallback:`,
                fontError.message
              );
              if (fontFamily.toLowerCase().includes("serif")) {
                finalFontFamily = "Times New Roman";
              } else if (fontFamily.toLowerCase().includes("mono")) {
                finalFontFamily = "Courier New";
              } else {
                finalFontFamily = "Arial";
              }
            }
          } else {
            // Font already loaded, use it directly
            finalFontFamily = fontFamily;
          }
        }

        const textOptions = {
          ...baseOptions,
          underline,
          width: baseOptions.width ? baseOptions.width : 240,
          text: text ? text : " ",
          fill: fill ? fill : "#333333",
          ...(textAlign && { textAlign }),
          ...(finalFontFamily && { fontFamily: finalFontFamily }),
          ...(fontSize && { fontSize }),
          ...(charSpacing && { charSpacing }),
          ...(lineHeight && { lineHeight }),
          metadata,
          ...(textAlign && { textAlign }),
          ...(finalFontFamily && { fontFamily: finalFontFamily }),
          ...(fontSize && { fontSize }),
          ...(charSpacing && { charSpacing }),
          ...(lineHeight && { lineHeight }),
          backgroundColor: backgroundColor || null,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          listType,
          listBullet,
        };
        // @ts-ignore
        const { text: textString, ...restTextOptions } = textOptions;
        const element = new fabric.IText(textString, {
          ...restTextOptions,
          editable: true,
        });

        if (eraser && !(eraser instanceof fabric.Object)) {
          // @ts-ignore
          fabric.util.enlivenObjects([eraser], (objects) => {
            element.eraser = objects[0];
          });
        }
        updateObjectShadow(element, item.shadow);

        resolve(element);
      } catch (err) {
        console.log("Failed to load staticText", err);
        resolve(null);
      }
    });
  }

  staticImage(item, canvas) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        const {
          src,
          cropX,
          cropY,
          filters,
          backgroundColor,
          eraser,
          clipPath,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          preview,
        } = item;

        let image;

        try {
          image = await loadImageFromURL(src);
        } catch (err) {
          console.log("Failed to load staticImage", err);
          resolve(null);
          return;
        }
        const element = new fabric.StaticImage(image, {
          ...baseOptions,
          // id: nanoid(),
          filters: [],
          cropX: cropX || 0,
          cropY: cropY || 0,
          backgroundColor: backgroundColor || null,
          // clipPath: clipPath,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          preview,
          strokeUniform: true,
          width: image.width,
          height: image.height,
          scaleX: 1,
          scaleY: 1,
        });

        // Handle fit image logic
        const imgW = image.width;
        const imgH = image.height;

        // The placeholder frame you want the image to fit inside
        const frameW = item.width * item.scaleX; // use from layer/item, not baseOptions.width
        const frameH = item.height * item.scaleY;

        // Ratios
        const imgRatio = imgW / imgH;
        const frameRatio = frameW / frameH;

        let scale;
        if (imgRatio > frameRatio) {
          // Image is wider than frame → fit by width
          scale = frameW / imgW;
        } else {
          // Image is taller than frame → fit by height
          scale = frameH / imgH;
        }

        // Apply scale
        element.scaleX = scale;
        element.scaleY = scale;

        if (element.originX === "left") {
          element.left =
            element.left +
            (item.width * item.scaleX) / 2 -
            (element.width * element.scaleX) / 2;
        }

        if (element.originY === "top") {
          element.top =
            element.top +
            (item.height * item.scaleY) / 2 -
            (element.height * element.scaleY) / 2;
        }

        element.filters = baseOptions.filters;
        element.applyFilters();
        adjustFilterBackend(element);

        if (eraser && !(eraser instanceof fabric.Object)) {
          // @ts-ignore
          fabric.util.enlivenObjects([eraser], (objects) => {
            element.eraser = objects[0];
          });
        } else if (eraser) {
          element.eraser = eraser;
        }

        const metadata = baseOptions.metadata;

        // updateObjectClipPath(element, item.clipPath);
        let outerRect = null;
        if (+metadata.currentRadius > 0) {
          outerRect = handleRadius2(
            metadata?.currentRadius,
            metadata?.currentStrokeWidth,
            canvas,
            element,
            element,
            metadata?.stroke
          );
        }

        updateObjectShadow(element, item.shadow);
        updateObjectFilters(element, filters);
        if (outerRect) {
          resolve([element, outerRect]);
        } else {
          resolve(element);
        }
      } catch (err) {
        console.log("Failed to load staticImage", err);
        resolve(null);
      }
    });
  }
  // @ts-ignore
  backgroundImage(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        // @ts-ignore
        const { src, cropX, cropY } = item;

        let image;

        try {
          image = await loadImageFromURL(src);
        } catch (err) {
          console.log("Failed to load staticImage", err);
          resolve(null);
          return;
        }
        const element = new fabric.BackgroundImage(image, {
          ...baseOptions,
          cropX: cropX || 0,
          cropY: cropY || 0,
        });
        updateObjectShadow(element, item.shadow);

        resolve(element);
      } catch (err) {
        console.log("Failed to load background image", err);
        resolve(null);
      }
    });
  }
  // @ts-ignore
  staticVideo(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        // @ts-ignore
        const { preview: src, cropX, cropY } = item;

        const image = await loadImageFromURL(src);
        if (!image) {
          resolve(null);
          return;
        }
        const element = new fabric.StaticImage(image, {
          ...baseOptions,
          cropX: cropX || 0,
          cropY: cropY || 0,
        });
        updateObjectShadow(element, item.shadow);

        resolve(element);
      } catch (err) {
        resolve(null);
      }
    });
  }

  // @ts-ignore
  staticPath(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        // @ts-ignore
        const { path, fill, clipPath, eraser } = item;

        const element = new fabric.StaticPath({
          ...baseOptions,
          // @ts-ignore
          path,
          fill,
          strokeLineCap: item?.strokeLineCap ?? "round",
          strokeLineJoin: item?.strokeLineJoin ?? "round",
          strokeUniform: item?.strokeUniform ?? true,
          eraser: eraser ?? null,
        });

        updateObjectShadow(element, item.shadow);
        if (eraser && !(eraser instanceof fabric.Object)) {
          // @ts-ignore
          fabric.util.enlivenObjects([eraser], (objects) => {
            element.eraser = objects[0];
          });
        }

        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }

  group(item, canvas) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        let objects = [];

        const promises = [];
        // @ts-ignore
        for (const object of item.objects) {
          const promise = new Promise(async (resolve) => {
            const fabricObject = await this.import(object, canvas, null, true);

            if (fabricObject) {
              resolve(fabricObject);
            } else {
              resolve(null);
            }
          });

          promises.push(promise);
        }

        const promisesSettled = await Promise.allSettled(promises);

        promisesSettled?.forEach((prom) => {
          if (prom?.status === "rejected") return;

          if (Array.isArray(prom.value)) {
            prom.value?.forEach((ele) => {
              if (
                ele?.id?.includes("svgMask") ||
                ele?.id?.includes("maskClipPathForGroup")
              )
                return;
              if (ele) objects.push(ele);
            });
          } else if (prom.value) {
            objects.push(prom.value);
          }
        });

        if (objects.length === 0) {
          console.log("Failed to load group layer");
          resolve(null);
          return;
        }

        const svgMasks = [];
        const svgMasksObjects = [];
        const svgMasksClones = [];

        objects?.forEach((object) => {
          if (object?.type === LayerType.MASK) {
            const clipPath = object?.clipPath;

            if (clipPath) {
              svgMasks.push(clipPath);
              svgMasksObjects.push(
                clipPath?.toObject(canvasPropertiesToInclude)
              );
            } else {
              console.error(
                "CUSTOM ERROR: clipPath not found in rendered build"
              );
            }
          }
        });

        await fabric.util.enlivenObjects(
          svgMasksObjects,
          function (arg1) {
            svgMasksClones.push(...arg1);

            svgMasksClones.forEach((mask) => {
              const maskObjectId = getMaskObjectIdFromMaskChildren(mask?.id);

              mask.id = `maskClipPathForGroup-${maskObjectId}`;
            });
          },
          ""
        );

        objects?.forEach((object) => {
          if (object?.type === LayerType.MASK) {
            const svgMaskClipPath = svgMasksClones.find(
              (mask) => mask?.id === `maskClipPathForGroup-${object?.id}`
            );
            if (svgMaskClipPath) {
              svgMaskClipPath.absolutePositioned = true;
              object.clipPath = svgMaskClipPath;

              // keep svgMaskClipPath.clipPath = null
              svgMaskClipPath.clipPath = null;
            }
          }
        });

        svgMasks.forEach((mask) => {
          const maskObjectId = getMaskObjectIdFromMaskChildren(mask?.id);

          const maskIndex = objects?.findIndex((o) =>
            o.id?.includes(maskObjectId)
          );

          const maskObject = objects?.find((o) => o.id === maskObjectId);

          // @ts-ignore
          const svgMaskProperties = maskObject?.svgMaskProperties;

          if (typeof maskIndex === "number" && maskIndex !== -1) {
            if (svgMaskProperties) {
              mask?.set({
                top: svgMaskProperties?.top,
                left: svgMaskProperties?.left,
                scaleX: svgMaskProperties?.scaleX,
                scaleY: svgMaskProperties?.scaleY,
                angle: svgMaskProperties?.angle,
              });
            }
            mask?.set({
              absolutePositioned: false,
              clipPath: null,
              id: `svgMask-${maskObjectId}`,
            });
            objects?.splice(maskIndex, 0, mask);
          }
        });

        // @ts-ignore
        const element = new fabric.Group(objects, baseOptions);

        element?._objects?.forEach((object) => {
          if (
            object?.type === LayerType.STATIC_IMAGE &&
            (object?.metadata?.currentStrokeWidth > 0 ||
              object?.metadata?.currentRadius > 0)
          ) {
            const currentStrokeWidth = object?.metadata?.currentStrokeWidth;

            const latestWidth =
              object?.getScaledWidth() * (element.scaleX ?? 1) -
              currentStrokeWidth;
            const latestHeight =
              object?.getScaledHeight() * (element.scaleY ?? 1) -
              currentStrokeWidth;

            const outerRect = element?._objects?.find(
              (o) => o.id === `radiusOuter-${object.id}`
            );

            if (outerRect) {
              outerRect?.set({
                width: latestWidth,
                height: latestHeight,
                scaleX: 1 / (element?.scaleX || 1),
                scaleY: 1 / (element?.scaleY || 1),
                originX: "center",
                originY: "center",
              });
            }
            if (object.type !== LayerType.FRAME) {
              object?.clipPath?.setPositionByOrigin(
                getGroupObjectPositionPointRelativeToCanvas(object),
                "center",
                "center"
              );

              object?.clipPath?.set({
                width: latestWidth,
                height: latestHeight,
                originX: object.originX,
                originY: object.originY,
              });
            }
          }

          if (object?.type === LayerType.MASK) {
            const maskObjectId = object?.id;

            const mask = item?.objects?.find((o) => o?.id === maskObjectId);
            if (mask) {
              object?.set({
                top: mask?.top,
                left: mask?.left,
              });
            }

            // handleMaskClipPathPositionInGroup(object, element);
          }
        });

        updateObjectShadow(element, item.shadow);
        resolve(element);
      } catch (err) {
        console.log("Failed to load group layer", err);
        resolve(null);
        return;
      }
    });
  }
  // @ts-ignore
  background(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);

        const { fill, id, name } = item;
        // @ts-ignore
        const element = new fabric.Rect({
          ...baseOptions,
          fill: fill ?? "#ffffff",
          id:
            id === "background" || !id
              ? !item.metadata?.notMainFrame
                ? INITIAL_FRAME_ID
                : nanoid()
              : id,
          name: name === "background" || !name ? nanoid() : name,
          type: LayerType.ARTBOARD,
          dirty: true,
          metadata: item?.metadata
            ? {
                ...item.metadata,
                clipToFrame:
                  item?.metadata?.clipToFrame !== null &&
                  item?.metadata?.clipToFrame !== undefined
                    ? item?.metadata?.clipToFrame
                    : true,
              }
            : { clipToFrame: true },
          visible: true,
          stroke: undefined,
          strokeWidth: 0,
          strokeUniform: true,
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          hasControls: true,
        });

        element.set({
          controls: getCustomCroppingControlsForArtboard(element.controls),
        });

        element.setControlsVisibility({ mtr: false });

        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }
  // @ts-ignore
  artboard(item) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        const { fill, id, name } = item;
        // @ts-ignore
        const element = new fabric.Rect({
          ...baseOptions,
          fill: fill,
          id: id ?? "Artboard",
          name: name ?? "Artboard 1",
          visible: true,
          type: LayerType.ARTBOARD,
          dirty: true,
          stroke: undefined,
          strokeWidth: 0,
          strokeUniform: true,
          metadata: item?.metadata
            ? {
                ...item.metadata,
                clipToFrame:
                  item?.metadata?.clipToFrame !== null &&
                  item?.metadata?.clipToFrame !== undefined
                    ? item?.metadata?.clipToFrame
                    : true,
              }
            : { clipToFrame: true },
        });

        element.set({
          controls: getCustomCroppingControlsForArtboard(element.controls),
        });

        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }

  staticVector(item, canvas) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item);
        const {
          src,
          clipPath,
          // objectColors,
          // objects,
          // _objects,
          eraser,
          locked,
          hasControls,
          editable,
          lockMovementX,
          lockMovementY,
          lockRotation,
          lockScalingX,
          lockScalingY,
          lockUniScaling,
          metadata,
          // @ts-ignore
        } = item;
        (src.startsWith("http")
          ? fabric.loadSVGFromURL
          : fabric.loadSVGFromString)(src, (objects, opts) => {
          if (!objects) {
            console.log("Failed to load staticVector layer");
            resolve(null);
            return;
          }
          const { width, height } = baseOptions;
          if (!width || !height) {
            baseOptions.width = opts.width;
            baseOptions.height = opts.height;
          }

          let element;

          element = new fabric.StaticVector(objects, opts, {
            ...baseOptions,
            src,
            // _objects,
            locked,
            hasControls,
            editable,
            lockMovementX,
            lockMovementY,
            lockRotation,
            lockScalingX,
            lockScalingY,
            lockUniScaling,
            scaleX: 1,
            scaleY: 1,
            // clipPath,
            // objectColors,
          });

          /**
           * This is old code which is there for backward compatibility. Because in the old implementation of StaticVector,
           * we used to set the objectColors field to store custom svg colors.
           *
           * Now, we are using {metadata.customColorMap} field to store custom svg colors.
           * This is done to reduce the StaticVector json size.
           */

          // -- old code starts here (for backward compatibility)

          if (item?.objectColors) {
            try {
              // create new color map from object colors
              const colorMap = createColorMapFromObjectColors(
                item.objectColors,
                element.objectColors
              );
              element.metadata = {
                ...element.metadata,
                customColorMap: colorMap,
              };
            } catch (err) {
              console.log("Failed to create color map from object colors", err);
            }

            if (
              item?.objectColors &&
              !Object.keys(item?.objectColors).includes("[object Object]")
            ) {
              const entries = Object.entries(element.objectColors);
              entries.forEach((en, i) => {
                const color = Object.keys(item.objectColors)[i];
                en[0] = color;
                // @ts-ignore
                en[1] = en[1].map((el) => el.set({ fill: color }));
              });
              const updatedObjectColors = Object.fromEntries(entries);
              element.set("objectColors", updatedObjectColors);
            } else {
              if (item.objectColors) {
                Object.values(element.objectColors).forEach((e, j) => {
                  e.forEach((el, i) => {
                    // if the fill is not present, then don't set the fill
                    // @ts-ignore
                    if (!Object.values(item.objectColors)[j][i].fill) {
                      return;
                    }
                    el.set(
                      "fill",
                      // @ts-ignore
                      typeof Object.values(item.objectColors)[j][i].fill ===
                        "string"
                        ? // @ts-ignore
                          Object.values(item.objectColors)[j][i].fill
                        : // @ts-ignore
                          new fabric.Gradient(
                            // @ts-ignore
                            Object.values(item.objectColors)[j][i].fill
                          )
                    );
                  });
                });
              }
            }
          }

          // -- old code ends here

          const strokeLineJoin = item?.metadata?.strokeLineJoin;
          if (element?._objects[0]?._objects) {
            element?._objects[0]?._objects?.forEach((o) => {
              if (
                (o instanceof fabric.Line ||
                  o instanceof fabric.Path ||
                  o instanceof fabric.Polyline) &&
                !item?.metadata?.currentStrokeWidth
              )
                return;
              o?.set({
                strokeWidth:
                  item?.metadata?.currentStrokeWidth ?? o?.strokeWidth ?? 0,
                stroke: item?.metadata?.stroke ?? o?.stroke ?? null,
                strokeUniform: o?.strokeUniform ?? true,
                strokeLineJoin: strokeLineJoin ?? o?.strokeLineJoin ?? "miter",
              });
            });
            // if (item.subObjectScaleX && item.subObjectScaleY) {
            //   element?._objects[0]?.set({
            //     scaleX: item.subObjectScaleX ?? 1,
            //     scaleY: item.subObjectScaleY ?? 1,
            //   });
            //   element?._objects[0]?.addWithUpdate();
            // }
          } else {
            element?._objects?.forEach((object) => {
              if (
                (object instanceof fabric.Line ||
                  object instanceof fabric.Path ||
                  object instanceof fabric.Polyline) &&
                !item?.metadata?.currentStrokeWidth
              )
                return;

              object?.set({
                scaleX: item.subObjectScaleX ?? 1,
                scaleY: item.subObjectScaleY ?? 1,
                strokeWidth: item?.metadata?.currentStrokeWidth ?? 0,
                stroke: item?.metadata?.stroke ?? null,
                strokeLineJoin: strokeLineJoin ?? "miter",
                strokeUniform: true,
              });
            });
          }

          element.width = baseOptions.width;
          element.height = baseOptions.height;

          if (eraser && !(eraser instanceof fabric.Object)) {
            // @ts-ignore
            fabric.util.enlivenObjects([eraser], (objects) => {
              element.eraser = objects[0];
            });
          }
          element.setCoords();

          element.addWithUpdate();
          element.scaleX = baseOptions.scaleX;
          element.scaleY = baseOptions.scaleY;

          element.set({
            top: baseOptions.top,
            left: baseOptions.left,
            originX: baseOptions.originX,
            originY: baseOptions.originY,
          });

          updateObjectShadow(element, item.shadow);

          resolve(element);
        });
      } catch (err) {
        console.log("Failed to load staticVector layer");
        resolve(null);
        return;
      }
    });
  }

  getBaseOptions(item) {
    const {
      id,
      name,
      left,
      top,
      width,
      height,
      scaleX,
      scaleY,
      opacity,
      flipX,
      flipY,
      skewX,
      skewY,
      stroke,
      strokeWidth,
      originX,
      originY,
      angle,
      filters,
      locked,
      hasControls,
      editable,
      lockMovementX,
      lockMovementY,
      lockRotation,
      lockScalingX,
      lockScalingY,
      lockUniScaling,
      selectable,
      evented,
      visible,
    } = item;
    let metadata = item.metadata ? item.metadata : {};
    let baseOptions = {
      id,
      filters: filters || [],
      name,
      angle: angle,
      top: top,
      left: left,
      width: width,
      height: height,
      originX: originX || "left",
      originY: originY || "top",
      scaleX: scaleX || 1,
      scaleY: scaleY || 1,
      opacity: opacity !== undefined && opacity !== null ? opacity : 1,
      flipX: flipX ? flipX : false,
      flipY: flipY ? flipY : false,
      skewX: skewX ? skewX : 0,
      skewY: skewY ? skewY : 0,
      ...(stroke && { stroke }),
      strokeWidth: strokeWidth ? strokeWidth : 0,
      strokeDashArray: item.strokeDashArray ? item.strokeDashArray : null,
      strokeLineCap: item.strokeLineCap ? item.strokeLineCap : "butt",
      strokeLineJoin: item.strokeLineJoin ? item.strokeLineJoin : "miter",
      strokeUniform: item.strokeUniform || false,
      strokeMiterLimit: item.strokeMiterLimit ? item.strokeMiterLimit : 4,
      strokeDashOffset: item.strokeDashOffset ? item.strokeMiterLimit : 0,
      metadata: metadata,
      locked,
      hasControls,
      editable,
      lockMovementX,
      lockMovementY,
      lockRotation,
      lockScalingX,
      lockScalingY,
      lockUniScaling,
      selectable: selectable ?? true,
      evented: evented ?? true,
      visible: visible,
    };
    return baseOptions;
  }
}

export async function loadTemplate(
  staticCanvas,
  template,
  params,
  withoutObjectBounds = false
) {
  const { frame } = template;
  staticCanvas.setWidth(frame.width).setHeight(frame.height);

  const objectImporter = new ObjectImporterRenderer();

  const promises = [];
  for (const layer of template.layers) {
    const promise = new Promise(async (resolve) => {
      try {
        const element = await objectImporter.import(
          layer,
          // @ts-ignore
          staticCanvas,
          params
        );
        if (element) {
          if (Array.isArray(element)) {
            resolve(element);
            return;
          }

          resolve(element);

          // handle object outline

          if (element?.type === "group") {
          }
        } else {
          console.log("UNABLE TO LOAD LAYER: ", layer);
          resolve(null);
        }
      } catch (error) {
        console.log("UNABLE TO LOAD LAYER");

        console.log(error);
        resolve(null);
      }
    });

    promises.push(promise);
  }

  const elements = await Promise.allSettled(promises);

  // load elements one by one, once all the promises are resolved.
  elements?.forEach((element) => {
    if (element?.status === "rejected") return;

    if (Array.isArray(element.value)) {
      element.value?.forEach((ele) => {
        if (ele) staticCanvas.add(ele);
      });
    } else if (element.value) {
      staticCanvas.add(element.value);
    }
  });
}

const customRenderer = (template, editor, isArtboardPreview, useWebp) => {
  return new Promise(async (resolve, reject) => {
    const staticCanvas = new fabric.StaticCanvas(null);
    const frameRef = editor?.frame?.frame;
    const params = frameRef ?? {};
    await loadTemplate(staticCanvas, template, params, false);

    const initialArtboard = staticCanvas._objects.find(
      (el) => el.id === INITIAL_FRAME_ID
    );
    const previewHeight = isArtboardPreview
      ? Math.max(initialArtboard?.getScaledHeight() || 0, 20)
      : staticCanvas.getHeight();
    const previewWidth = isArtboardPreview
      ? Math.max(initialArtboard?.getScaledWidth() || 0, 20)
      : staticCanvas.getWidth();

    // IF CONTAINS VIDEO, add await
    const data = staticCanvas.toDataURL({
      top: isArtboardPreview ? initialArtboard?.top : 0,
      left: isArtboardPreview ? initialArtboard?.left : 0,
      height: previewHeight,
      width: previewWidth,
      format: useWebp ? "webp" : "png",
    });
    // return data
    resolve(data);
  });
};

export const createImageFromTemplate = async (template) => {
  // Exclude the Background & Checkbox Layer
  const checkboxBGLayerIndex = template.layers.findIndex(
    (el) => el?.metadata?.type === backgroundLayerType
  );
  const canvasBGLayerIndex = template.layers.findIndex(
    (el) => el?.id === "background"
  );

  if (checkboxBGLayerIndex !== -1) {
    template.layers.splice(checkboxBGLayerIndex, 1);
    template.layers.splice(canvasBGLayerIndex, 1);
  }

  // Exclude the hidden layers from exports
  const hiddenLayersIDs = [];

  template.layers?.forEach((el) => {
    if (el?.visible === false) {
      hiddenLayersIDs.push(el.id);
    }
  });

  template = {
    ...template,
    layers: template.layers
      .filter(
        (layer) => !hiddenLayersIDs.includes(layer.id)
        // && layer.id !== 'watermark'
      )

      .map((each) => {
        return { ...each, src: each.preview };
      }),
  };
  // Handling the offset of multiple canvas
  // Get the artboard position and calculate other layer's position assuming that artboard position is at 0 0
  const artboardRef = template.layers.find(
    (el) => el.type === LayerType.ARTBOARD
  );
  const { top, left } = artboardRef;
  template.layers = template.layers.map((layer) => {
    if (layer.type === LayerType.ARTBOARD) {
      return { ...layer, top: 0, left: 0 };
    } else if (layer.type === LayerType.MASK) {
      layer.clipPath = {
        ...layer.clipPath,
        top: layer.clipPath.top - top,
        left: layer.clipPath.left - left,
      };
      return { ...layer, top: layer.top - top, left: layer.left - left };
    } else {
      return { ...layer, top: layer.top - top, left: layer.left - left };
    }
  });

  const image = await customRenderer(template, null, false, false); // skipFontLoading = true
  return image;
};

// main function

const template = {
  id: "Main Artboard",
  name: "Artboard-1",
  layers: [
    // {
    //   id: "Main Artboard",
    //   name: "Design 01",
    //   left: 0,
    //   top: 0,
    //   width: 1080,
    //   height: 1080,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#333",
    //   strokeWidth: 0.2,
    //   originX: "left",
    //   originY: "top",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: null,
    //   fill: "#FCF6F1FF",
    //   metadata: {
    //     clipToFrame: true,
    //   },
    //   shadow: null,
    //   backgroundColor: "",
    //   type: "Artboard",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    // },
    // {
    //   id: "F8s-uOltbW152xCFrDdT3",
    //   name: "image_link",
    //   left: 275,
    //   top: 540,
    //   width: 2160,
    //   height: 2880,
    //   scaleX: 0.2361111111111111,
    //   scaleY: 0.3611111111111111,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#000000",
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: "Main Artboard",
    //   fill: null,
    //   metadata: {
    //     generationDate: 1756365706603,
    //     originalLayerPreview:
    //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
    //     isSampleImg: false,
    //     frameId: "Main Artboard",
    //     stroke: "#000000",
    //     currentStrokeWidth: 0,
    //     currentRadius: 0,
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticImage",
    //   preview:
    //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
    //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372310735.jpeg",
    //   visible: true,
    //   eraser: null,
    //   cropX: 0,
    //   cropY: 0,
    // },
    // {
    //   id: "cdi91RvLZek7Z2YQ4KYme",
    //   name: "title",
    //   left: 805,
    //   top: 268.3351521296544,
    //   width: 470,
    //   height: 328.32,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: "Main Artboard",
    //   fill: "#1A1A1AFF",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "Feel elegant in our midi dress with a flattering silhouette, flowing long skirt, and halter neckline, perfect for dressing up. Style this floral dress with strappy heels for a head-turning look, ideal for weddings and special occasions.",
    //     frameId: "Main Artboard",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Abel-Regular",
    //   fontSize: 36,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
    //   text: "Feel elegant in our midi dress with a flattering silhouette, flowing long skirt, and halter neckline, perfect for dressing up. Style this floral dress with strappy heels for a head-turning look, ideal for weddings and special occasions.",
    //   textAlign: "center",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 1.16,
    //   charSpacing: 0,
    // },
    // {
    //   id: "ZYJ3gA8ICgRNyasr66QLv",
    //   name: "additional_image_link",
    //   left: 805,
    //   top: 745,
    //   width: 2160,
    //   height: 2880,
    //   scaleX: 0.2361111111111111,
    //   scaleY: 0.1701388888888889,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: "radiusMask-ZYJ3gA8ICgRNyasr66QLv",
    //   fill: null,
    //   metadata: {
    //     generationDate: 1756365706603,
    //     originalLayerPreview:
    //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
    //     isSampleImg: false,
    //     frameId: "Main Artboard",
    //     stroke: "#000000",
    //     currentStrokeWidth: 0,
    //     currentRadius: 20,
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticImage",
    //   preview:
    //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
    //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310735.jpeg",
    //   visible: true,
    //   eraser: null,
    //   cropX: 0,
    //   cropY: 0,
    // },
    // {
    //   id: "OjoEFE_LFZK0X_8pIttZn",
    //   name: "price",
    //   left: 908.27,
    //   top: 1028.23,
    //   width: 263.4688629646695,
    //   height: 36,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#000000FF",
    //   strokeWidth: 1.5,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: "Main Artboard",
    //   fill: "#000000",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "12,999.00 INR",
    //     frameId: "Main Artboard",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Abel-Regular",
    //   fontSize: 36,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
    //   text: "12,999.00 INR",
    //   textAlign: "right",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 1.16,
    //   charSpacing: 0,
    // },
    // {
    //   id: "VRU54p6LbqxKmxa8EZUba",
    //   name: "id",
    //   left: 983.9,
    //   top: 28,
    //   width: 151.826171875,
    //   height: 20,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: false,
    //   clipPath: "Main Artboard",
    //   fill: "#A1480BFF",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "KAREN MILLEN",
    //     frameId: "Main Artboard",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Abel-Regular",
    //   fontSize: 20,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-e94d1410-d317-445b-af8c-ff51931d3867.ttf",
    //   text: "KAREN MILLEN",
    //   textAlign: "right",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 0.9,
    //   charSpacing: 0,
    // },
    // {
    //   id: "GfQYGnU67_oLmKweGV0x3",
    //   name: "Design 2",
    //   left: 1291.5564904225698,
    //   top: 14.473218303161545,
    //   width: 1080,
    //   height: 1080,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#333",
    //   strokeWidth: 0.2,
    //   originX: "left",
    //   originY: "top",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: null,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: null,
    //   fill: "#FCF6F1FF",
    //   metadata: {
    //     clipToFrame: true,
    //   },
    //   shadow: null,
    //   backgroundColor: "",
    //   type: "Artboard",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    // },
    // {
    //   id: "R7McAWbZQybsfa8haessR",
    //   name: "Soul of the Archer Sagittarius Necklace",
    //   left: 1568.3937663309962,
    //   top: 770.8634124620008,
    //   width: 467,
    //   height: 69.12,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "GfQYGnU67_oLmKweGV0x3",
    //   fill: "#1A1A1AFF",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "Soul of the Archer Sagittarius Necklace",
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Akatab-Regular",
    //   fontSize: 32,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
    //   text: "Soul of the Archer Sagittarius Necklace",
    //   textAlign: "left",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 1.16,
    //   charSpacing: 0,
    // },
    // {
    //   id: "_UVzsretSLIyZ1h3BGHbi",
    //   name: "media_public_.jpeg",
    //   left: 1567.3258011438834,
    //   top: 463.47454887666447,
    //   width: 2160,
    //   height: 2880,
    //   scaleX: 0.2166037359378585,
    //   scaleY: 0.1556016783850545,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: null,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "radiusMask-_UVzsretSLIyZ1h3BGHbi",
    //   fill: null,
    //   metadata: {
    //     generationDate: 1756365706603,
    //     originalLayerPreview:
    //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
    //     isSampleImg: false,
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //     stroke: "#000000",
    //     currentStrokeWidth: 0,
    //     currentRadius: 20,
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticImage",
    //   preview:
    //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
    //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756368361680-copy-1756370617784-copy-1756372291538-copy-1756372310129-copy-1756374794087.jpeg",
    //   visible: true,
    //   eraser: null,
    //   cropX: 0,
    //   cropY: 0,
    // },
    // {
    //   id: "zr_m4ixdqV6on18mh6gi8",
    //   name: "Zariin",
    //   left: 1568.3937663309962,
    //   top: 86.70094809451048,
    //   width: 470,
    //   height: 36,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: null,
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "GfQYGnU67_oLmKweGV0x3",
    //   fill: "#1A1A1AFF",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "Zariin",
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Abyssinica SIL-Regular",
    //   fontSize: 36,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-fb17e50d-9922-4d85-912d-a2bd3f269df6.ttf",
    //   text: "Zariin",
    //   textAlign: "left",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 1.16,
    //   charSpacing: 0,
    // },
    // {
    //   id: "7w-LTzn-lP4uFpJ9rCKWF",
    //   name: "1,299.00 INR",
    //   left: 1465.8787663309963,
    //   top: 1019.6876147611775,
    //   width: 263.47,
    //   height: 36,
    //   scaleX: 1,
    //   scaleY: 1,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#000000FF",
    //   strokeWidth: 1.5,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: true,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "GfQYGnU67_oLmKweGV0x3",
    //   fill: "#000000",
    //   metadata: {
    //     generationDate: 1756368735948,
    //     os: "1,299.00 INR",
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticText",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   fontFamily: "Akatab-Regular",
    //   fontSize: 36,
    //   fontURL:
    //     "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
    //   text: "1,299.00 INR",
    //   textAlign: "left",
    //   textLines: null,
    //   underline: null,
    //   listBullet: null,
    //   listType: null,
    //   lineHeight: 1.16,
    //   charSpacing: 0,
    // },
    // {
    //   id: "bp5y6d4denXY6CNe3AQxj",
    //   name: "Line",
    //   left: 1333.3937663309962,
    //   top: 969.1109480945103,
    //   width: 432.1840323165625,
    //   height: 0,
    //   scaleX: 1,
    //   scaleY: 0.10380658169906383,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#B1B1B1FF",
    //   strokeWidth: 10,
    //   originX: "left",
    //   originY: "top",
    //   angle: 0,
    //   filters: null,
    //   locked: null,
    //   hasControls: true,
    //   editable: null,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "GfQYGnU67_oLmKweGV0x3",
    //   fill: "rgb(0,0,0)",
    //   metadata: {
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //   },
    //   shadow: null,
    //   backgroundColor: "",
    //   type: "line",
    //   preview: null,
    //   src: null,
    //   visible: true,
    //   eraser: null,
    //   x1: -216.09201615828124,
    //   x2: 216.09201615828124,
    //   y1: 0,
    //   y2: 0,
    // },
    // {
    //   id: "eeVNGHYyVidKQHDCVh-y8",
    //   name: "media_public_.jpeg",
    //   left: 2101.756490422572,
    //   top: 554.4732183031615,
    //   width: 2160,
    //   height: 2880,
    //   scaleX: 0.25,
    //   scaleY: 0.375,
    //   opacity: 1,
    //   flipX: false,
    //   flipY: false,
    //   skewX: 0,
    //   skewY: 0,
    //   stroke: "#000000",
    //   strokeWidth: 0,
    //   originX: "center",
    //   originY: "center",
    //   angle: 0,
    //   filters: null,
    //   locked: false,
    //   hasControls: true,
    //   editable: null,
    //   lockMovementX: false,
    //   lockMovementY: false,
    //   lockRotation: false,
    //   lockScalingX: false,
    //   lockScalingY: false,
    //   lockUniScaling: null,
    //   clipPath: "GfQYGnU67_oLmKweGV0x3",
    //   fill: null,
    //   metadata: {
    //     generationDate: 1756365706603,
    //     originalLayerPreview:
    //       "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
    //     isSampleImg: false,
    //     frameId: "GfQYGnU67_oLmKweGV0x3",
    //     stroke: "#000000",
    //     currentStrokeWidth: 0,
    //     currentRadius: 0,
    //   },
    //   shadow: null,
    //   backgroundColor: null,
    //   type: "StaticImage",
    //   preview:
    //     "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
    //   src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374794087.jpeg",
    //   visible: true,
    //   eraser: null,
    //   cropX: 0,
    //   cropY: 0,
    // },
    {
      id: "NhdUtho_3ZcrNNB0R_w-V",
      name: "Design 3",
      left: 2605.089822593395,
      top: 35.173893260740854,
      width: 1080,
      height: 1080,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: "#333",
      strokeWidth: 0.2,
      originX: "left",
      originY: "top",
      angle: 0,
      filters: null,
      locked: null,
      hasControls: true,
      editable: null,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: null,
      fill: "#FCFCF2FF",
      metadata: {
        clipToFrame: true,
      },
      shadow: null,
      backgroundColor: "",
      type: "Artboard",
      preview: null,
      src: null,
      visible: true,
      eraser: null,
    },
    {
      id: "6v7qjxC8RdlIDQhT8eFvp",
      name: "title",
      left: 3145.1898225933955,
      top: 121.87430546325224,
      width: 553.2703971119136,
      height: 32,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: null,
      strokeWidth: 0,
      originX: "center",
      originY: "center",
      angle: 0,
      filters: null,
      locked: null,
      hasControls: true,
      editable: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: "NhdUtho_3ZcrNNB0R_w-V",
      fill: "#44463BFF",
      metadata: {
        generationDate: 1756368735948,
        os: "Washed Indigo Lacework Co-Ord Set",
        frameId: "NhdUtho_3ZcrNNB0R_w-V",
      },
      shadow: null,
      backgroundColor: null,
      type: "StaticText",
      preview: null,
      src: null,
      visible: true,
      eraser: null,
      fontFamily: "Alata-Regular",
      fontSize: 32,
      fontURL:
        "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-330c240b-aade-4b3e-a9a2-eae241ad18cc.ttf",
      text: "Washed Indigo Lacework Co-Ord Set",
      textAlign: "center",
      textLines: null,
      underline: null,
      listBullet: null,
      listType: null,
      lineHeight: 1.1400000000000001,
      charSpacing: 0,
    },
    {
      id: "DDEpjSYW2ENLSBY5vQVGR",
      name: "brand",
      left: 2891.8812290463275,
      top: 1036.117181877075,
      width: 470,
      height: 36,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: null,
      strokeWidth: 0,
      originX: "center",
      originY: "center",
      angle: 0,
      filters: null,
      locked: null,
      hasControls: true,
      editable: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: "NhdUtho_3ZcrNNB0R_w-V",
      fill: "#1A1A1AFF",
      metadata: {
        generationDate: 1756368735948,
        os: "Zariin",
        frameId: "NhdUtho_3ZcrNNB0R_w-V",
      },
      shadow: null,
      backgroundColor: null,
      type: "StaticText",
      preview: null,
      src: null,
      visible: true,
      eraser: null,
      fontFamily: "Abyssinica SIL-Regular",
      fontSize: 36,
      fontURL:
        "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-fb17e50d-9922-4d85-912d-a2bd3f269df6.ttf",
      text: "Zariin",
      textAlign: "left",
      textLines: null,
      underline: null,
      listBullet: null,
      listType: null,
      lineHeight: 1.16,
      charSpacing: 0,
    },
    {
      id: "H2n44I6IymYwsL_DaFNll",
      name: "price",
      left: 3473.137739227566,
      top: 1039.3671818770752,
      width: 354.8671875,
      height: 48,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: "#000000FF",
      strokeWidth: 1.5,
      originX: "center",
      originY: "center",
      angle: 0,
      filters: null,
      locked: null,
      hasControls: true,
      editable: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: "NhdUtho_3ZcrNNB0R_w-V",
      fill: "#000000",
      metadata: {
        generationDate: 1756368735948,
        os: "1,299.00 INR",
        frameId: "NhdUtho_3ZcrNNB0R_w-V",
      },
      shadow: null,
      backgroundColor: null,
      type: "StaticText",
      preview: null,
      src: null,
      visible: true,
      eraser: null,
      fontFamily: "Akatab-Regular",
      fontSize: 48,
      fontURL:
        "https://ai-image-editor-wasabi-bucket.apyhi.com/fonts/font/Regular-5e2e5a6b-5b07-4220-ae18-9996d36c2279.ttf",
      text: "1,299.00 INR",
      textAlign: "right",
      textLines: null,
      underline: null,
      listBullet: null,
      listType: null,
      lineHeight: 1.22,
      charSpacing: 0,
    },
    {
      id: "xBBEYJXId3BJuzOKTZxBp",
      name: "image_link",
      left: 2875.089822593395,
      top: 574.1724712385835,
      width: 2160,
      height: 2880,
      scaleX: 0.25,
      scaleY: 0.27,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: null,
      strokeWidth: 0,
      originX: "center",
      originY: "center",
      angle: 0,
      filters: null,
      locked: false,
      hasControls: true,
      editable: null,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: "NhdUtho_3ZcrNNB0R_w-V",
      fill: null,
      metadata: {
        generationDate: 1756365706603,
        originalLayerPreview:
          "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
        isSampleImg: false,
        frameId: "NhdUtho_3ZcrNNB0R_w-V",
        stroke: "#000000",
        currentStrokeWidth: 0,
        currentRadius: 0,
      },
      shadow: null,
      backgroundColor: null,
      type: "StaticImage",
      preview:
        "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
      src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756374965094-copy-1756376490087.jpeg",
      visible: true,
      eraser: null,
      cropX: 0,
      cropY: 0,
    },
    {
      id: "LKnoQenTKbaMOKOpsRLQX",
      name: "additional_image_link",
      left: 3415.2898225933964,
      top: 575.7349563854231,
      width: 2160,
      height: 2880,
      scaleX: 0.25,
      scaleY: 0.2708333333333333,
      opacity: 1,
      flipX: false,
      flipY: false,
      skewX: 0,
      skewY: 0,
      stroke: "#000000",
      strokeWidth: 0,
      originX: "center",
      originY: "center",
      angle: 0,
      filters: [
        // {
        //   type: "Sepia",
        // },
      ],
      locked: false,
      hasControls: true,
      editable: null,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: null,
      clipPath: "NhdUtho_3ZcrNNB0R_w-V",
      fill: null,
      metadata: {
        generationDate: 1756365706603,
        originalLayerPreview:
          "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
        isSampleImg: false,
        frameId: "NhdUtho_3ZcrNNB0R_w-V",
        stroke: "#000000",
        currentStrokeWidth: 0,
        currentRadius: 0,
        activeFilter: "Sepia",
      },
      shadow: null,
      backgroundColor: null,
      type: "StaticImage",
      preview:
        "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
      src: "https://studio-user-storage-wasabi-bucket-cdn.phot.ai/user-assets/67f3df1adc3c3a7d4b0893aa/user-design/68b000e728b434f14210eeb6/03f2e2ef36e1ee7cd923c-copy-1756370617781-copy-1756372291542-copy-1756372309830-copy-1756374791546-copy-1756376490088.jpeg",
      visible: true,
      eraser: null,
      cropX: 0,
      cropY: 0,
    },
  ],
  frame: {
    width: 1080,
    height: 1080,
  },
  metadata: {
    animated: false,
  },
};
// const main = async () => {
//   try {
//     // Call the function to read XLSX
//     const data = await readXlsxFromUrl(
//       "https://s3.us-east-2.wasabisys.com/studio-assets/darshan_test/coyu-test.xlsx"
//     );

//     if (!data || data.length === 0) {
//       console.error("❌ No data received from XLSX file");
//       return;
//     }

//     console.log("🚀 Starting batch image generation...");
//     console.log("📝 Template has", template.layers.length, "layers");
//     console.log("📊 Data has", data.length, "rows");

//     // Process all data rows and generate images in parallel

//     console.log({data})
//     const results = await processJsonDataAndGenerateImages(data, template);

//     console.log("\n🎯 Final Results:");
//     console.log(
//       `✅ Successfully generated: ${results.successful.length} images`
//     );
//     if (results.failed.length > 0) {
//       console.log(`❌ Failed: ${results.failed.length} images`);
//       results.failed.forEach((fail) => {
//         if (fail.status === "rejected") {
//           console.log(
//             `  - Row ${fail.reason?.index || "unknown"}: ${
//               fail.reason?.message || fail.reason
//             }`
//           );
//         } else {
//           console.log(`  - Row ${fail.value.index}: ${fail.value.error}`);
//         }
//       });
//     }
//   } catch (error) {
//     console.error("❌ Error in main process:", error);
//   }
// };

// main();

// Global font cache to avoid reloading fonts
const fontCache = new Set<string>();

// Function to load all fonts from template once
async function loadTemplateFonts(template: any) {
  const fontPromises: Promise<string>[] = [];

  template.layers.forEach((layer: any) => {
    if (layer.type === "StaticText" && layer.fontURL && layer.fontFamily) {
      const fontKey = `${layer.fontFamily}-${layer.fontURL}`;
      if (!fontCache.has(fontKey)) {
        fontCache.add(fontKey);
        fontPromises.push(loadFont(layer.fontURL, layer.fontFamily));
      }
    }
  });

  if (fontPromises.length > 0) {
    console.log(`🔤 Loading ${fontPromises.length} fonts...`);
    await Promise.allSettled(fontPromises);
    console.log("✅ All fonts loaded successfully");
  }
}

// Function to check if font is already loaded
function isFontLoaded(fontFamily: string, fontURL: string): boolean {
  const fontKey = `${fontFamily}-${fontURL}`;
  return fontCache.has(fontKey);
}

// Function to process JSON data and generate images in parallel
export async function processJsonDataAndGenerateImages(
  jsonData: any[],
  template: any
) {
  try {
    console.log("🚀 Starting batch image generation...");
    console.log(
      `📊 Processing ${jsonData.length - 1} data rows (excluding header row)`
    );

    await loadTemplateFonts(template);

    const dataRows = jsonData.slice(1);

    // Create promses for parallel processing
    const imagePromises = dataRows.map(async (row, index) => {
      try {
        const templateClone = JSON.parse(JSON.stringify(template));

        templateClone.layers.forEach((layer: any) => {
          if (
            layer.type === LayerType.STATIC_TEXT ||
            layer.type === LayerType.TEXT
          ) {
            const columnName = layer.name;
            const columnIndex = jsonData[0].indexOf(columnName);

            if (columnIndex !== -1 && row[columnIndex] !== undefined) {
              layer.text = row[columnIndex];

              layer.metadata.os = row[columnIndex];
            }
          }

          if (layer.type === LayerType.STATIC_IMAGE) {
            const columnName = layer.name;
            const columnIndex = jsonData[0].indexOf(columnName);

            if (columnIndex !== -1 && row[columnIndex] !== undefined) {
              layer.preview = row[columnIndex];
              layer.src = row[columnIndex];
            }
          }
        });

        const image = await createImageFromTemplate(templateClone);

        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const shouldGenerateImageFile = true;
        if (shouldGenerateImageFile) {
          const buffer = Buffer.from(base64Data, "base64");

          const filename = `output_${index + 1}.png`;

          const fs = await import("fs");
          fs.default.writeFileSync(filename, buffer);
        }

        return { success: true, base64Data, index: index + 1 };
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        return { success: false, error: error.message, index: index + 1 };
      }
    });

    const results = await Promise.allSettled(imagePromises);
    // console.log(results);

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    );
    const failed = results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
    );

    console.log(`\n🎉 Batch processing completed!`);
    console.log(`Successfully generated: ${successful.length} images`);
    if (failed.length > 0) {
      console.log(`Failed to generate: ${failed.length} images`);
    }

    return { successful, failed };
  } catch (error) {
    console.error("Error in batch processing:", error);
    throw error;
  }
}
