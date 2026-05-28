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
  HighlightToggle,
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

function chineseToolbarLabel(source: string) {
  const normalized = source.trim().toLowerCase();
  if (!normalized || /[\u4e00-\u9fff]/.test(source)) return "";

  const labels: Array<[RegExp, string]> = [
    [/undo/, "撤销"],
    [/redo/, "重做"],
    [/block type|select block|paragraph|heading/, "段落/标题类型"],
    [/bold/, "加粗"],
    [/italic/, "斜体"],
    [/underline/, "下划线"],
    [/strike|strikethrough/, "删除线"],
    [/superscript/, "上标"],
    [/subscript/, "下标"],
    [/inline code|code toggle|code$/, "行内代码"],
    [/highlight/, "高亮"],
    [/toggle group/, "列表类型"],
    [/bullet|unordered/, "无序列表"],
    [/number|ordered/, "有序列表"],
    [/check/, "任务清单"],
    [/link/, "插入链接"],
    [/image/, "插入图片"],
    [/table/, "插入表格"],
    [/thematic|horizontal|break/, "插入分隔线"],
    [/code block/, "插入代码块"],
    [/language/, "代码语言"],
    [/rich text/, "可视化编辑"],
    [/source/, "源码编辑"],
    [/diff/, "对比模式"]
  ];

  return labels.find(([pattern]) => pattern.test(normalized))?.[1] ?? "";
}

function localizeToolbarTitles(root: HTMLElement | null) {
  const toolbar = root?.querySelector<HTMLElement>(".admin-markdown-editor-toolbar");
  if (!toolbar) return;

  toolbar.querySelectorAll<HTMLElement>("button, [role='button'], [aria-label], [title]").forEach((element) => {
    const current = element.getAttribute("title") || element.getAttribute("aria-label") || element.textContent || "";
    const label = chineseToolbarLabel(current);
    if (!label) return;
    element.setAttribute("title", label);
    element.setAttribute("aria-label", label);
  });
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
  const shellRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;

    localizeToolbarTitles(root);
    const observer = new MutationObserver(() => localizeToolbarTitles(root));
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["title", "aria-label"] });
    return () => observer.disconnect();
  }, [editorId, toolbarActions]);

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
                    <UndoRedo />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <StrikeThroughSupSubToggles />
                    <CodeToggle />
                    <HighlightToggle />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    {toolbarActions ? (
                      <div className="admin-markdown-toolbar-actions">{toolbarActions}</div>
                    ) : null}
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
    <div className="admin-markdown-editor-shell" ref={shellRef}>
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
    </div>
  );
}
