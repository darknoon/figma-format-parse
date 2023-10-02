import {
  Button,
  Columns,
  Container,
  render,
  Text,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { ChangeEvent } from "preact/compat";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  FigmaMeta,
  readHTMLMessage,
  writeHTMLMessage,
  Message,
  Header,
} from "fig-kiwi";
import { Buffer } from "buffer";

import { CloseHandler } from "./types";
import { Schema, prettyPrintSchema } from "kiwi-schema";

const bytesReplacer = (key: string, value: any): any => {
  if (
    typeof value == "object" &&
    value instanceof Uint8Array &&
    key == "bytes"
  ) {
    console.log("replace buffer with length", value.byteLength);
    return Buffer.from(value).toString("base64");
  }
  return value;
};

const bytesReplacerInverse = (key: string, value: any): any => {
  if (key === "bytes" && typeof value === "string") {
    return Buffer.from(value, "base64");
  }
  return value;
};

function Plugin() {
  const [data, setData] = useState<
    | {
        meta: FigmaMeta;
        message: Message;
        schema: Schema;
        header: Header;
      }
    | undefined
  >(undefined);

  const [modifiedText, setModifiedText] = useState<string | null>(null);

  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>("CLOSE");
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      console.log("types", e.clipboardData?.types);
      const html = e.clipboardData?.getData("text/html");
      if (html) {
        try {
          const { message, meta, schema, header } = readHTMLMessage(html);
          console.log("setting data");
          setData({ meta, message, schema, header });
          console.log("done setting data");
         } catch (e) {
          console.error("Error parsing clipboard data", e);
         }
      }
    },
    [setData]
  );
  const [valid, setIsValid] = useState(false);

  const validateMessage = (text: string) => {
    const message = JSON.parse(text, bytesReplacerInverse);
    // TODO: run through compiled schema
    return typeof message === "object";
  };

  const handleDataChanged = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = (e?.target as HTMLTextAreaElement).value;
      setModifiedText(text);
      setIsValid(validateMessage(text));
      // If data is valid
    },
    [setData, data, setIsValid]
  );

  const textField = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const askDoPaste = useCallback(() => {
    try {
      textField.current?.focus();
      console.log("execCommand paste");
      // document.execCommand("copy");
      document.execCommand("paste");
    } catch (e) {
      console.warn(e);
    }
  }, [container, textField]);

  const handleCopy = useCallback(
    (e: ClipboardEvent) => {
      console.log("In handleCopy");
      const schema = data?.schema;
      if (!modifiedText || !validateMessage(modifiedText) || !schema) {
        return;
      }
      const message = JSON.parse(modifiedText, bytesReplacerInverse) as Message;
      const { pasteFileKey: fileKey = "", pasteID = 0 } = message;
      const html = writeHTMLMessage({
        schema,
        message,
        meta: { fileKey, pasteID, dataType: "scene" },
      });
      console.log("have message. meta", {
        fileKey,
        pasteID,
        dataType: "scene",
      });
      console.log(`have html ${html.length} bytes`);
      e.preventDefault();
      e.clipboardData?.clearData();
      e.clipboardData?.setData("text/html", html);
      console.log(`set html`, html);
      const roundTrip = readHTMLMessage(html);
      console.log("rt", roundTrip);
    },
    [data, modifiedText]
  );

  const handleCopyModified = useCallback(() => {
    console.log("handle copy modified");
    textField.current?.focus();
    document.execCommand("copy");
  }, []);

  // Force paste on show
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
    <Container
      space="medium"
      onPaste={handlePaste}
      onCopy={handleCopy}
      ref={container}
    >
      <VerticalSpace space="large" />
      <Button onClick={askDoPaste}>Paste</Button>
      <Text>
        <pre>{JSON.stringify(data?.header, undefined, 2)}</pre>
      </Text>
      <TextboxMultiline
        style={{ height: 300 }}
        value={
          modifiedText ??
          (data ? JSON.stringify(data.message, bytesReplacer, 2) : "none")
        }
        onInput={handleDataChanged}
      />
      <TextboxMultiline
        style={{ height: 300 }}
        value={
          data && data.schema ? prettyPrintSchema(data.schema) : "no schema"
        }
        onInput={handleDataChanged}
      />
      <VerticalSpace space="small" />
      {!data ? (
        <input onPaste={handlePaste} value="paste here" ref={textField} />
      ) : null}
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleCopyModified} disabled={!valid}>
          Copy Modified
        </Button>
        <Button fullWidth onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
