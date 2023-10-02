import FigmaArchiveParser, { Header } from "./archive";
import { readFileSync, writeFileSync } from "fs";

const parseExample = (
  ex: string
): {
  header: Header;
  files: Uint8Array[];
} => {
  const data = readFileSync(__dirname + `/../data/${ex}.fig`);
  const parsed = FigmaArchiveParser.parseArchive(data);
  const [figmeta, figdata, preview] = parsed.files;
  writeFileSync(__dirname + `/../data/${ex}.fig-data`, figdata);
  writeFileSync(__dirname + `/../data/${ex}.fig-meta`, figmeta);
  writeFileSync(__dirname + `/../data/${ex}.preview.png`, preview);
  return parsed;
};

test("able to parse archive", () => {
  // const data = readFileSync(__dirname + "/../data/blue-circle.fig");
  const parsed = parseExample("blue-circle");
  expect(parsed.files.length).toBe(3);
  expect(parsed.files.map((f) => f.length)).toEqual([11083, 269, 6273]);
});

test("able to parse other archives", () => {
  parseExample("red-circle");
  parseExample("c0000-circle");
});
