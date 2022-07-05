import { readFileSync, writeFileSync } from "fs";
import { parseHTMLString } from "./fightml";
import FigmaArchiveParser from "./archive";
import { compileSchema, decodeBinarySchema } from "kiwi-schema";
import {
  Schema as CompiledSchema,
  Message,
  SparseMessage,
  NodeChange,
} from "./fig-kiwi";
import { inflateRaw } from "pako";
import { writeHTMLMessage } from "./index";
import schema from "./schema";

test("parses components from html string", () => {
  const str = readFileSync(__dirname + "/data/c00000-circle-paste.html", {
    encoding: "utf-8",
  });

  const { figma, meta } = parseHTMLString(str);

  expect(meta).toEqual({
    fileKey: "whhd71XEXzYNauiHCeztfu",
    pasteID: 2130739331,
    dataType: "scene",
  });

  expect(figma.byteLength).toBeGreaterThan(1000);

  // Just to make debugging easier, extract the file
  writeFileSync(
    __dirname + "/data/c00000-circle-paste.fig",
    new Uint8Array(figma)
  );

  const parsed = FigmaArchiveParser.parseArchive(figma);
  expect(parsed.files.length).toBe(2);

  const [schemaFile, dataFile] = parsed.files;
  const fileSchema = decodeBinarySchema(inflateRaw(schemaFile));

  const cs = compileSchema(fileSchema) as CompiledSchema;

  const message: SparseMessage = cs.decodeSparseMessage(inflateRaw(dataFile));
  expect(message).toMatchSnapshot();
});

test("write canned message to html", () => {
  const message: Message = JSON.parse(
    readFileSync(__dirname + "/data/grey-circle-paste.json", {
      encoding: "utf8",
    })
  );

  const html = writeHTMLMessage({
    meta: { fileKey: "abcd", pasteID: 0, dataType: "scene" },
    schema: schema,
    message,
  });

  writeFileSync(__dirname + "/gen/grey-circle-regen.html", html);
  expect(html).toMatchSnapshot();
});

test("write html string", () => {
  const nodeToCreate: NodeChange = {
    guid: {
      sessionID: 13,
      localID: 2,
    },
    phase: "CREATED",
    parentIndex: {
      guid: {
        sessionID: 0,
        localID: 1,
      },
      position: "!",
    },
    type: "ELLIPSE",
    name:
      "Butterfucker " +
      Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Math.random() * 1000
      ),
    visible: true,
    locked: false,
    opacity: 1,
    // blendMode: "PASS_THROUGH",
    size: {
      x: 310,
      y: 310,
    },
    // transform: {
    //   m00: 1,
    //   m01: 0,
    //   m02: 584,
    //   m10: 0,
    //   m11: 1,
    //   m12: 543,
    // },
    // dashPattern: [],
    // mask: false,
    // maskIsOutline: false,
    // cornerRadius: 0,
    // miterLimit: 4,
    // strokeWeight: 1,
    // horizontalConstraint: "MIN",
    // strokeAlign: "INSIDE",
    // strokeCap: "NONE",
    // strokeJoin: "MITER",
    // verticalConstraint: "MIN",
    fillPaints: [
      {
        type: "SOLID",
        color: {
          r: Math.random(),
          g: Math.random(),
          b: Math.random(),
          a: 1,
        },
        opacity: 1,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
    // strokePaints: [],
    // handleMirroring: "NONE",
    // proportionsConstrained: true,
    // cornerSmoothing: 0,
    // arcData: {
    //   startingAngle: 0,
    //   endingAngle: 6.2831854820251465,
    //   innerRadius: 0,
    // },
  };

  const message: Message = {
    type: "NODE_CHANGES",
    sessionID: 0,
    ackID: 0,
    pasteID: 1180497570,
    pasteFileKey: "vDQhnT3wvDCl0P7UjANY7L",
    pasteIsPartiallyOutsideEnclosingFrame: false,
    pastePageId: {
      sessionID: 0,
      localID: 1,
    },
    isCut: false,
    pasteEditorType: "DESIGN",
    nodeChanges: [
      // {
      //   guid: {
      //     sessionID: 0,
      //     localID: 0,
      //   },
      //   phase: "CREATED",
      //   type: "DOCUMENT",
      //   name: "Document",
      //   visible: true,
      //   opacity: 1,
      //   blendMode: "PASS_THROUGH",
      //   mask: false,
      //   maskIsOutline: false,
      // },
      {
        guid: {
          sessionID: 0,
          localID: 1,
        },
        phase: "CREATED",
        parentIndex: {
          guid: {
            sessionID: 0,
            localID: 0,
          },
          position: "!",
        },
        type: "CANVAS",
        name: "Page 1",
        visible: true,
        opacity: 1,
        blendMode: "PASS_THROUGH",
        transform: {
          m00: 1,
          m01: 0,
          m02: 0,
          m10: 0,
          m11: 1,
          m12: 0,
        },
        backgroundEnabled: true,
        mask: false,
        maskIsOutline: false,
        backgroundOpacity: 1,
        backgroundColor: {
          r: 0.11764705926179886,
          g: 0.11764705926179886,
          b: 0.11764705926179886,
          a: 1,
        },
        exportBackgroundDisabled: false,
      },
      nodeToCreate,
      // {
      //   guid: {
      //     sessionID: 20000013,
      //     localID: 2,
      //   },
      //   phase: "CREATED",
      //   parentIndex: {
      //     guid: {
      //       sessionID: 0,
      //       localID: 0,
      //     },
      //     position: '"',
      //   },
      //   type: "CANVAS",
      //   name: "Internal Only Canvas",
      //   visible: false,
      //   opacity: 1,
      //   blendMode: "PASS_THROUGH",
      //   // transform: {
      //   //   m00: 1,
      //   //   m01: 0,
      //   //   m02: 0,
      //   //   m10: 0,
      //   //   m11: 1,
      //   //   m12: 0,
      //   // },
      //   backgroundEnabled: true,
      //   mask: false,
      //   maskIsOutline: false,
      //   backgroundOpacity: 1,
      //   backgroundColor: {
      //     r: 0.11764705926179886,
      //     g: 0.11764705926179886,
      //     b: 0.11764705926179886,
      //     a: 1,
      //   },
      //   exportBackgroundDisabled: false,
      //   internalOnly: true,
      // },
    ],
  };

  const html = writeHTMLMessage({
    meta: { fileKey: "abcd", pasteID: 1234, dataType: "scene" },
    schema,
    message,
  });

  expect(html).not.toBeNull();
  writeFileSync(__dirname + "/gen/just-ellipse.html", html);
  // expect(html).toMatchSnapshot();
});
