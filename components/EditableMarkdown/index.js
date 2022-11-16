import { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import MarkdownRenderer from "../MarkdownRenderer";
import styles from "./EditableMarkdown.module.css";

export default function EditableMarkdown({ initialContent, onChange }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);

  const textRef = useRef();

  function insertAtCursor(myField, myValue) {
    //MOZILLA and others
    if (myField.selectionStart || myField.selectionStart === 0) {
      var startPos = myField.selectionStart;
      var endPos = myField.selectionEnd;
      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
      myField.selectionStart = startPos + myValue.length;
      myField.selectionEnd = startPos + myValue.length;
    } else {
      myField.value += myValue;
    }
  }

  const onChangeHandler = function (e) {
    if (editing) {
      const target = e.target;
      textRef.current.style.height = "100%";
      textRef.current.style.height = `${target.scrollHeight}px`;
      setContent(target.value);
      onChange(target.value);
    }
  };

  // set correct heights for prefilled textareas on first render
  useEffect(() => {
    if (editing) {
      textRef.current.style.height = "100%";
      textRef.current.style.height = `${textRef.current.scrollHeight}px`;
      textRef.current.focus();
    }
  }, [editing]);

  const insertCharacter = function (myValue) {
    console.log("INTERSTING NRE  CHARCER", myValue);
    setContent((oldContent) => {
      const myField = textRef.current;
      let newContent = "";

      if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        newContent = oldContent.substring(0, startPos) + myValue + oldContent.substring(endPos, oldContent.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
      } else {
        newContent = myField.value += myValue;
      }

      onChange(newContent);
      return newContent;
    });
  };

  const View = editing ? (
    <>
      <textarea ref={textRef} onChange={onChangeHandler} value={content}></textarea>
      <div style={{ display: "flex", gap: "5px" }} className={styles["print-hide"]}>
        <Button
          mini
          onClick={(e) => {
            setEditing(false);
          }}
        >
          Done
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("¬");
          }}
        >
          ¬
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("∨");
          }}
        >
          ∨
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("∧");
          }}
        >
          ∧
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("∃");
          }}
        >
          ∃
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("⟶");
          }}
        >
          ⟶
        </Button>
        <Button
          mini
          onClick={() => {
            insertCharacter("⟷");
          }}
        >
          ⟷
        </Button>
      </div>
    </>
  ) : (
    <MarkdownRenderer content={content} />
  );

  return (
    <>
      <div className={styles["editable-markdown"]}>{View}</div>
      {!editing && (
        <Button
          mini
          onClick={(e) => {
            setEditing(true);
          }}
        >
          Edit
        </Button>
      )}
    </>
  );
}
