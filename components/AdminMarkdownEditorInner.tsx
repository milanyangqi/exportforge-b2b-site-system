"use client";

import { type ForwardedRef, type ReactNode, useImperativeHandle, useMemo, useRef } from "react";
import MDEditor from "@uiw/react-md-editor/nohighlight";
import * as commands from "@uiw/react-md-editor/commands-cn";
import type { ICommand } from "@uiw/react-md-editor/commands";

export type AdminMarkdownEditorHandle = {
  focus: (callback?: () => void, options?: unknown) => void;
  getMarkdown: () => string;
  insertMarkdown: (markdown: string) => void;
  setMarkdown: (markdown: string) => void;
};

export type AdminMarkdownEditorProps = {
  editorId: string;
  value: string;
  placeholder?: string;
  toolbarActions?: ReactNode;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
};

type AdminMarkdownEditorInnerProps = AdminMarkdownEditorProps & {
  editorRef: ForwardedRef<AdminMarkdownEditorHandle>;
};

function insertIntoTextarea(textarea: HTMLTextAreaElement, value: string, markdown: string) {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const nextValue = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
  const cursor = start + markdown.length;

  return { cursor, nextValue };
}

function compactCommand(command: ICommand, label: string, title: string): ICommand {
  return {
    ...command,
    buttonProps: {
      ...(command.buttonProps ?? {}),
      "aria-label": title,
      title
    },
    icon: <span className="admin-md-command-text">{label}</span>
  };
}

export default function AdminMarkdownEditorInner({
  editorId,
  editorRef,
  value,
  placeholder,
  toolbarActions,
  onChange
}: AdminMarkdownEditorInnerProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const textarea = () => shellRef.current?.querySelector<HTMLTextAreaElement>("textarea");

  const editorCommands = useMemo(() => [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.divider,
    compactCommand(commands.title1, "H1", "插入一级标题"),
    compactCommand(commands.title2, "H2", "插入二级标题"),
    compactCommand(commands.title3, "H3", "插入三级标题"),
    commands.divider,
    commands.quote,
    commands.code,
    commands.codeBlock,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    commands.link,
    commands.image,
    commands.table,
    commands.hr
  ], []);

  const editorExtraCommands = useMemo(() => [
    commands.codeEdit,
    commands.codeLive,
    commands.codePreview,
    commands.fullscreen
  ], []);

  useImperativeHandle(editorRef, () => ({
    focus(callback) {
      const control = textarea();
      if (!control) return;
      control.focus();
      callback?.();
    },
    getMarkdown() {
      return latestValueRef.current;
    },
    insertMarkdown(markdown) {
      const control = textarea();
      if (!control) {
        onChange(`${latestValueRef.current.trimEnd()}${latestValueRef.current.trim() ? "\n\n" : ""}${markdown.trim()}\n\n`);
        return;
      }

      const { cursor, nextValue } = insertIntoTextarea(control, latestValueRef.current, markdown);
      onChange(nextValue);
      window.requestAnimationFrame(() => {
        control.focus();
        control.setSelectionRange(cursor, cursor);
      });
    },
    setMarkdown(markdown) {
      onChange(markdown);
    }
  }), [onChange]);

  return (
    <div className="admin-markdown-editor-shell admin-uiw-markdown-shell" ref={shellRef}>
      {toolbarActions ? <div className="admin-editor-media-tools">{toolbarActions}</div> : null}
      <MDEditor
        className="admin-markdown-editor admin-uiw-markdown-editor"
        commands={editorCommands}
        data-color-mode="light"
        extraCommands={editorExtraCommands}
        height={720}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        preview="edit"
        textareaProps={{
          "aria-label": "Markdown 正文编辑器",
          placeholder
        }}
        value={value}
        visibleDragbar={false}
      />
    </div>
  );
}
