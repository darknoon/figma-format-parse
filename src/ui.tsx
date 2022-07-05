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
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { FigmaMeta, readHTMLMessage } from "../modules/fig-kiwi/index";
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
        const { message, meta } = readHTMLMessage(html);
        console.log("setting data");
        setData({ meta, data: message });
        console.log("done setting data");
      }
    },
    [setData]
  );

  const textField = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  // const askDoPaste = useCallback(() => {
  //   // const text = navigator.clipboard.readText();
  //   let t = document.createElement("textarea");
  //   console.log("asking to paste into ", t);
  //   t.value = "Copying from Figma failed. Please try again in the desktop app.";
  //   t.style.top = "0";
  //   t.style.left = "0";
  //   t.style.position = "fixed";
  //   // document.body.appendChild(t),
  //   container.current?.appendChild(t);
  //   t.focus(), t.select();
  //   try {
  //     document.execCommand("copy");
  //     // document.execCommand("paste");
  //   } catch (e) {
  //     console.warn(e);
  //   }
  //   document.body.removeChild(t);
  // }, [container, textField]);

  const askDoPaste = useCallback(() => {
    try {
      textField.current?.focus();
      console.log("running command");
      // document.execCommand("copy");
      document.execCommand("paste");
    } catch (e) {
      console.warn(e);
    }
  }, [container, textField]);

  useEffect(() => {
    console.log("wating to paste");
    setTimeout(() => {
      console.log("pasting");
      if (textField.current) {
        textField.current?.focus();
        document.execCommand("paste");
      }
    }, 10);
    console.log("running command");
    // document.execCommand("copy");
  }, [textField.current]);
  return (
    <Container space="medium" onPaste={handlePaste} ref={container}>
      <VerticalSpace space="large" />
      {
        // Don't need a user gesture!
        /* <Button onClick={askDoPaste}>Paste</Button> */
      }
      <Text>
        <pre>{data ? JSON.stringify(data.data, undefined, 2) : "none"}</pre>
      </Text>
      <VerticalSpace space="small" />
      {data === null ? (
        <input onPaste={handlePaste} value="paste here" ref={textField} />
      ) : null}
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
