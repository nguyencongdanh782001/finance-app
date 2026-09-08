"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import FileHandler from "@tiptap/extension-file-handler";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { useEffect, useState } from "react";
import {
  Bold,
  Code,
  Eraser,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RichTextDocument } from "@/lib/rich-text";

const colors = [
  "#2D2226",
  "#D96C8A",
  "#A43E5F",
  "#65545B",
  "#2F6F6D",
  "#B7791F",
];
type Props = {
  preset?: "compact" | "full";
  value: RichTextDocument | null;
  onChange: (value: RichTextDocument) => void;
  onHtmlChange?: (html: string) => void;
  legacyHtml?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  maxCharacters?: number;
  required?: boolean;
  uploadContext?: "PRODUCT_DESCRIPTION" | "STORE_POLICY";
  label?: string;
  error?: string;
  onBlur?: () => void;
};

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="size-9 shrink-0 text-(--admin-text-secondary) hover:bg-[#FCEEF3] hover:text-[#A43E5F]"
    >
      {children}
    </Button>
  );
}

function uploadImage(
  file: File,
  context: Props["uploadContext"],
  onProgress: (value: number) => void,
) {
  if (!context) return Promise.reject(new Error("Ngữ cảnh tải ảnh không hợp lệ."));
  const body = new FormData();
  body.append("file", file);
  body.append("context", context);
  return new Promise<{ url: string; alt: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/editor-images");
    request.upload.onprogress = (event) =>
      event.lengthComputable &&
      onProgress(Math.round((event.loaded / event.total) * 100));
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300) resolve(result);
        else reject(new Error(result.message || "Không thể tải ảnh lên."));
      } catch {
        reject(new Error("Phản hồi tải ảnh không hợp lệ."));
      }
    };
    request.onerror = () => reject(new Error("Mất kết nối khi tải ảnh."));
    request.send(body);
  });
}

export default function RichTextEditor({
  preset = "full",
  value,
  onChange,
  onHtmlChange,
  legacyHtml,
  placeholder = "Nhập nội dung...",
  disabled,
  readOnly,
  minHeight = 240,
  maxCharacters = 20_000,
  required,
  uploadContext,
  label = "Nội dung",
  error,
  onBlur,
}: Props) {
  const isCompact = preset === "compact";
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [focusedImage, setFocusedImage] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled && !readOnly,
    content: value || legacyHtml || undefined,
    extensions: [
      StarterKit.configure(
        isCompact
          ? {
              heading: false,
              blockquote: false,
              code: false,
              codeBlock: false,
              horizontalRule: false,
            }
          : { heading: { levels: [2, 3, 4] } },
      ),
      Underline,
      ...(isCompact
        ? []
        : [
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TextStyle,
            Color.configure({ types: [TextStyle.name] }),
            Highlight.configure({ multicolor: true }),
          ]),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
      ...(isCompact
        ? []
        : [
            Image.configure({ allowBase64: false, inline: false }),
            FileHandler.configure({
              allowedMimeTypes: [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/avif",
              ],
              onDrop: (_editor, files) => void insertFiles(files),
              onPaste: (_editor, files) => void insertFiles(files),
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
          ]),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxCharacters }),
      Typography,
    ],
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getJSON() as RichTextDocument);
      onHtmlChange?.(instance.getHTML());
    },
    onBlur,
  });
  async function insertFiles(files: File[]) {
    if (!editor || !files.length) return;
    for (const file of files) {
      setUploadError("");
      setUploading(1);
      try {
        const result = await uploadImage(file, uploadContext, setUploading);
        const alt =
          window.prompt(
            "Văn bản thay thế cho ảnh (bắt buộc khi xuất bản)",
            result.alt || "",
          ) ?? "";
        editor.chain().focus().setImage({ src: result.url, alt }).run();
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Không thể tải ảnh lên.",
        );
      } finally {
        setUploading(0);
      }
    }
  }
  useEffect(() => {
    if (
      editor &&
      value &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(value)
    )
      editor.commands.setContent(value);
  }, [editor, value]);
  if (!editor)
    return (
      <div className="overflow-hidden rounded-xl border border-(--admin-border) bg-white">
        <div className="h-11 animate-pulse border-b bg-[#F8F5F6]" />
        <div style={{ minHeight }} className="animate-pulse bg-white" />
        <div className="h-8 animate-pulse border-t bg-[#F8F5F6]" />
      </div>
    );
  const count = editor
    .getText({ blockSeparator: " " })
    .replace(/\s+/g, " ")
    .trim().length;
  const characterError =
    maxCharacters && count > maxCharacters
      ? `Nội dung vượt quá ${maxCharacters.toLocaleString("vi-VN")} ký tự.`
      : undefined;
  const displayError = error || characterError;
  const action = (command: () => boolean) => {
    command();
    editor.commands.focus();
  };
  return (
    <div
      className={`grid gap-2 ${isCompact ? "rich-text-editor-compact" : ""}`}
      data-field-path={label === "Mô tả" ? "description" : undefined}
    >
      <label className="text-sm font-semibold text-(--admin-text)">
        {label}
        {required ? <span className="ml-1 text-[#D96C8A]">*</span> : null}
      </label>
      <div
        className={`overflow-hidden rounded-xl border bg-white ${displayError ? "border-red-400" : "border-(--admin-border)"}`}
        aria-describedby={displayError ? "rich-text-error" : undefined}
      >
        <div
          className="sticky top-0 z-10 flex max-w-full items-center gap-0.5 overflow-x-auto border-b bg-[#F8F5F6] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="toolbar"
          aria-label="Định dạng nội dung"
        >
          <ToolbarButton
            label="Hoàn tác"
            onClick={() => action(() => editor.chain().undo().run())}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Làm lại"
            onClick={() => action(() => editor.chain().redo().run())}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
          <span className="mx-1 h-6 w-px bg-[#EAE1E4]" />
          {!isCompact ? (
            <>
              <ToolbarButton
                label="Tiêu đề 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() =>
                  action(() => editor.chain().toggleHeading({ level: 2 }).run())
                }
              >
                <Heading2 className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Tiêu đề 3"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() =>
                  action(() => editor.chain().toggleHeading({ level: 3 }).run())
                }
              >
                <Heading3 className="size-4" />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton
            label="Đậm"
            active={editor.isActive("bold")}
            onClick={() => action(() => editor.chain().toggleBold().run())}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Nghiêng"
            active={editor.isActive("italic")}
            onClick={() => action(() => editor.chain().toggleItalic().run())}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Gạch chân"
            active={editor.isActive("underline")}
            onClick={() => action(() => editor.chain().toggleUnderline().run())}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Gạch ngang"
            active={editor.isActive("strike")}
            onClick={() => action(() => editor.chain().toggleStrike().run())}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          {!isCompact ? (
            <ToolbarButton
              label="Mã nội tuyến"
              active={editor.isActive("code")}
              onClick={() => action(() => editor.chain().toggleCode().run())}
            >
              <Code className="size-4" />
            </ToolbarButton>
          ) : null}
          <span className="mx-1 h-6 w-px bg-[#EAE1E4]" />
          <ToolbarButton
            label="Danh sách"
            active={editor.isActive("bulletList")}
            onClick={() =>
              action(() => editor.chain().toggleBulletList().run())
            }
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Danh sách đánh số"
            active={editor.isActive("orderedList")}
            onClick={() =>
              action(() => editor.chain().toggleOrderedList().run())
            }
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          {!isCompact ? (
            <>
              <ToolbarButton
                label="Trích dẫn"
                active={editor.isActive("blockquote")}
                onClick={() =>
                  action(() => editor.chain().toggleBlockquote().run())
                }
              >
                <Quote className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Đường kẻ ngang"
                onClick={() =>
                  action(() => editor.chain().setHorizontalRule().run())
                }
              >
                <Minus className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Bảng"
                onClick={() =>
                  action(() =>
                    editor
                      .chain()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run(),
                  )
                }
              >
                <Table2 className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Thêm ảnh"
                onClick={() =>
                  document.getElementById("rich-text-image-input")?.click()
                }
              >
                <ImagePlus className="size-4" />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton
            label="Liên kết"
            active={editor.isActive("link")}
            onClick={() => {
              const href = window.prompt(
                "URL liên kết (https:// hoặc mailto:)",
                editor.getAttributes("link").href || "https://",
              );
              if (href && /^(https?:\/\/|mailto:)/i.test(href))
                action(() => editor.chain().setLink({ href }).run());
            }}
          >
            <Link2 className="size-4" />
          </ToolbarButton>
          {!isCompact ? <div className="ml-1 flex items-center gap-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Màu chữ ${color}`}
                className="size-5 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() =>
                  action(() => editor.chain().setColor(color).run())
                }
              />
            ))}
            <ToolbarButton
              label="Màu đánh dấu"
              onClick={() =>
                action(() =>
                  editor.chain().toggleHighlight({ color: "#FCEEF3" }).run(),
                )
              }
            >
              <Highlighter className="size-4" />
            </ToolbarButton>
          </div> : null}
          {isCompact ? (
            <ToolbarButton
              label="Xóa định dạng"
              onClick={() =>
                action(() =>
                  editor.chain().unsetAllMarks().clearNodes().run(),
                )
              }
            >
              <Eraser className="size-4" />
            </ToolbarButton>
          ) : null}
        </div>
        {!isCompact ? (
          <input
            id="rich-text-image-input"
            className="hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(event) => {
              void insertFiles([...(event.target.files || [])]);
              event.currentTarget.value = "";
            }}
          />
        ) : null}
        <EditorContent
          editor={editor}
          className="rich-text-editor"
          style={{ minHeight }}
          onFocus={() => setFocusedImage(true)}
        />
        <div className="flex min-h-8 items-center justify-between gap-2 border-t bg-[#F8F5F6] px-3 text-xs text-(--admin-text-muted)">
          <span>
            {uploading
              ? `Đang tải ảnh lên ${uploading}%...`
              : uploadError ||
              (focusedImage && !isCompact
                  ? "Bạn có thể dán hoặc kéo thả ảnh vào nội dung."
                  : "")}
          </span>
          <span>
            {count.toLocaleString("vi-VN")} /{" "}
            {maxCharacters.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
      {displayError ? (
        <p id="rich-text-error" className="text-sm text-red-600">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
