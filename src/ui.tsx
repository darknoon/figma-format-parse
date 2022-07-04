import {
  Button,
  Columns,
  Container,
  render,
  Text,
  Textbox,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useState } from "preact/hooks";
import {
  FigmaMeta,
  ParsedFigmaHTML,
  parseHTMLString,
} from "../modules/fig-kiwi/fightml";
import { Buffer } from "buffer";
import FigDataParser from "../modules/fig-kiwi/figdata";

import { CloseHandler, CreateRectanglesHandler } from "./types";
import { Schema, SparseMessage } from "../modules/fig-kiwi/fig-kiwi";
import FigmaArchiveParser from "../modules/fig-kiwi/archive";
import { compileSchema, decodeBinarySchema } from "kiwi-schema";
import { inflateRaw } from "pako";

function Plugin() {
  const [data, setData] = useState<{
    meta: FigmaMeta;
    data: SparseMessage;
  } | null>(null);
  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>("CLOSE");
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      console.log(e.clipboardData?.types);
      const html = e.clipboardData?.getData("text/html");
      if (html) {
        const { figma, meta } = parseHTMLString(html);
        const [schema, data] = FigmaArchiveParser.parseArchive(figma)?.files;
        const s = compileSchema(
          decodeBinarySchema(inflateRaw(schema))
        ) as Schema;
        const result = s.decodeMessage(inflateRaw(data));
        setData({ meta, data: result });
      }
    },
    [setData]
  );

  const askDoPaste = useCallback(async () => {
    const text = navigator.clipboard.readText();
  }, []);

  return (
    <Container space="medium" onPaste={handlePaste}>
      <VerticalSpace space="large" />
      <Text onFocus={() => 1}>
        <pre>{data ? JSON.stringify(data.data, undefined, 2) : "none"}</pre>
      </Text>
      <VerticalSpace space="small" />
      <Textbox onPaste={handlePaste} value="paste here" />
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall">
        {/* <Button fullWidth onClick={handleCreateRectanglesButtonClick}>
          Create
        </Button> */}
        <Button fullWidth onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
