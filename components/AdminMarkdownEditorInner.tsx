"use client";

import { type ForwardedRef, type ReactNode, useEffect, useMemo, useRef } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from "@mdxeditor/editor";

export type AdminMarkdownEditorProps = {
  editorId: string;
  value: string;
  placeholder?: string;
  toolbarActions?: ReactNode;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
};

type AdminMarkdownEditorInnerProps = AdminMarkdownEditorProps & {
  editorRef: ForwardedRef<MDXEditorMethods>;
};

function setForwardedEditorRef(ref: ForwardedRef<MDXEditorMethods>, value: MDXEditorMethods | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) ref.current = value;
}

export default function AdminMarkdownEditorInner({
  editorId,
  editorRef,
  value,
  placeholder,
  toolbarActions,
  onChange,
  onImageUpload
}: AdminMarkdownEditorInnerProps) {
  const localEditorRef = useRef<MDXEditorMethods | null>(null);
  const latestUploadHandlerRef = useRef(onImageUpload);

  useEffect(() => {
    latestUploadHandlerRef.current = onImageUpload;
  }, [onImageUpload]);

  useEffect(() => {
    const editor = localEditorRef.current;
    if (!editor) return;
    if (editor.getMarkdown() !== value) editor.setMarkdown(value);
  }, [editorId, value]);

  const plugins = useMemo(() => [
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: (file) => latestUploadHandlerRef.current(file),
      disableImageResize: false,
      allowSetImageDimensions: true
    }),
    tablePlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        text: "Text",
        js: "JavaScript",
        jsx: "JavaScript JSX",
        ts: "TypeScript",
        tsx: "TypeScript React",
        css: "CSS",
        html: "HTML",
        json: "JSON",
        bash: "Shell"
      }
    }),
    diffSourcePlugin({ viewMode: "rich-text" }),
    markdownShortcutPlugin(),
    toolbarPlugin({
      toolbarClassName: "admin-markdown-editor-toolbar",
      toolbarContents: () => (
        <DiffSourceToggleWrapper options={["rich-text", "source"]}>
          <ConditionalContents
            options={[
              {
                when: (editor) => editor?.editorType === "codeblock",
                contents: () => <ChangeCodeMirrorLanguage />
              },
              {
                fallback: () => (
                  <>
                    {toolbarActions ? (
                      <>
                        <div className="admin-markdown-toolbar-actions">{toolbarActions}</div>
                        <Separator />
                      </>
                    ) : null}
                    <UndoRedo />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <StrikeThroughSupSubToggles />
                    <CodeToggle />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <Separator />
                    <InsertTable />
                    <InsertThematicBreak />
                    <InsertCodeBlock />
                  </>
                )
              }
            ]}
          />
        </DiffSourceToggleWrapper>
      )
    })
  ], [toolbarActions]);

  return (
    <MDXEditor
      className="admin-markdown-editor"
      contentEditableClassName="admin-markdown-editor-content detail-body"
      markdown={value}
      onChange={(markdown, initialMarkdownNormalize) => {
        if (!initialMarkdownNormalize) onChange(markdown);
      }}
      onError={({ error }) => console.warn(`MDXEditor parse error: ${error}`)}
      placeholder={placeholder}
      ref={(instance) => {
        localEditorRef.current = instance;
        setForwardedEditorRef(editorRef, instance);
      }}
      trim={false}
      plugins={plugins}
    />
  );
}
