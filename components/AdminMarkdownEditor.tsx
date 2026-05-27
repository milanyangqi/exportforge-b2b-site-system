"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { AdminMarkdownEditorProps } from "./AdminMarkdownEditorInner";

const DynamicAdminMarkdownEditor = dynamic(() => import("./AdminMarkdownEditorInner"), {
  ssr: false,
  loading: () => <div className="admin-markdown-editor-loading">编辑器加载中...</div>
});

export type AdminMarkdownEditorHandle = MDXEditorMethods;

export const AdminMarkdownEditor = forwardRef<AdminMarkdownEditorHandle, AdminMarkdownEditorProps>((props, ref) => (
  <DynamicAdminMarkdownEditor {...props} editorRef={ref} />
));

AdminMarkdownEditor.displayName = "AdminMarkdownEditor";
