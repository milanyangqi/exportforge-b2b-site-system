"use client";

import type { ReactNode } from "react";

type ArticleBlock =
  | { type: "code"; content: string; language: string }
  | { type: "text"; content: string };

function parseArticleBlocks(body: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  const textBuffer: string[] = [];
  let codeBuffer: string[] | null = null;
  let codeLanguage = "";

  function flushText() {
    const content = textBuffer.join("\n").trim();
    if (content) blocks.push({ type: "text", content });
    textBuffer.length = 0;
  }

  for (const line of body.split("\n")) {
    const codeFence = /^```(.*)$/.exec(line.trim());

    if (codeFence) {
      if (codeBuffer) {
        blocks.push({ type: "code", content: codeBuffer.join("\n"), language: codeLanguage });
        codeBuffer = null;
        codeLanguage = "";
        continue;
      }

      flushText();
      codeBuffer = [];
      codeLanguage = codeFence[1]?.trim() || "text";
      continue;
    }

    if (codeBuffer) {
      codeBuffer.push(line);
      continue;
    }

    if (!line.trim()) {
      flushText();
      continue;
    }

    textBuffer.push(line);
  }

  if (codeBuffer !== null) blocks.push({ type: "code", content: codeBuffer.join("\n"), language: codeLanguage });
  flushText();

  return blocks;
}

function renderInlineContent(text: string, key: number): ReactNode {
  const candidates = [
    {
      match: /`([^`]+)`/.exec(text),
      render: (match: RegExpExecArray) => <code>{match[1]}</code>
    },
    {
      match: /\[([^\]]+)]\(([^)]+)\)/.exec(text),
      render: (match: RegExpExecArray) => {
        const label = match[1];
        const href = match[2];

        return (
          <a className="article-file-link" href={href} download={label.startsWith("下载文件：") ? label.replace(/^下载文件：/, "") : undefined}>
            {label}
          </a>
        );
      }
    },
    {
      match: /\*\*([^*]+)\*\*/.exec(text),
      render: (match: RegExpExecArray) => <strong>{match[1]}</strong>
    },
    {
      match: /~~([^~]+)~~/.exec(text),
      render: (match: RegExpExecArray) => <del>{match[1]}</del>
    },
    {
      match: /<u>(.*?)<\/u>/.exec(text),
      render: (match: RegExpExecArray) => <u>{match[1]}</u>
    },
    {
      match: /<sup>(.*?)<\/sup>/.exec(text),
      render: (match: RegExpExecArray) => <sup>{match[1]}</sup>
    },
    {
      match: /<sub>(.*?)<\/sub>/.exec(text),
      render: (match: RegExpExecArray) => <sub>{match[1]}</sub>
    },
    {
      match: /\*([^*]+)\*/.exec(text),
      render: (match: RegExpExecArray) => <em>{match[1]}</em>
    }
  ].filter((candidate) => candidate.match);
  const current = candidates.sort((a, b) => (a.match?.index ?? 0) - (b.match?.index ?? 0))[0];

  if (!current?.match) return text;

  const token = current.match[0];
  const before = text.slice(0, current.match.index);
  const after = text.slice(current.match.index + token.length);

  return (
    <>
      {before}
      {current.render(current.match)}
      {after ? renderInlineContent(after, key + 1) : null}
    </>
  );
}

function renderParagraphLines(text: string, key: number) {
  const lines = text.split("\n");

  return lines.map((line, index) => (
    <span key={`${key}-${index}`}>
      {index > 0 ? <br /> : null}
      {renderInlineContent(line, key + index)}
    </span>
  ));
}

function renderTable(lines: string[], key: number) {
  const [headerLine, _separator, ...bodyLines] = lines;
  const headers = headerLine.split("|").map((cell) => cell.trim()).filter(Boolean);
  const rows = bodyLines.map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean));

  return (
    <table className="article-table" key={key}>
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${key}-${rowIndex}`}>
            {row.map((cell, cellIndex) => <td key={`${key}-${rowIndex}-${cellIndex}`}>{renderInlineContent(cell, key + cellIndex)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function isLikelyImageReference(name: string, url: string) {
  return /\.(apng|avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(name) || /\.(apng|avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url);
}

function renderArticleBlock(block: ArticleBlock, index: number) {
  if (block.type === "code") {
    return (
      <pre className="article-code-block" key={`${index}-code`}>
        <code>{block.content}</code>
      </pre>
    );
  }

  const trimmed = block.content.trim();
  const lines = trimmed.split("\n");
  const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(trimmed);
  const fileBlockMatch = /^\[下载文件：([^\]]+)]\(([^)]+)\)$/.exec(trimmed);

  if (imageMatch) {
    return (
      <figure className="article-inline-image" key={`${index}-${trimmed}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageMatch[2]} alt={imageMatch[1] || "Article image"} />
      </figure>
    );
  }

  if (fileBlockMatch && isLikelyImageReference(fileBlockMatch[1], fileBlockMatch[2])) {
    return (
      <figure className="article-inline-image" key={`${index}-${trimmed}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileBlockMatch[2]} alt={fileBlockMatch[1] || "Article image"} />
      </figure>
    );
  }

  if (fileBlockMatch) {
    return (
      <p className="article-download-line" key={`${index}-${trimmed}`}>
        <a className="article-file-link" href={fileBlockMatch[2]} download>
          下载文件：{fileBlockMatch[1]}
        </a>
      </p>
    );
  }

  if (trimmed.startsWith("# ")) return <h1 key={`${index}-${trimmed}`}>{trimmed.slice(2)}</h1>;
  if (trimmed.startsWith("## ")) return <h2 key={`${index}-${trimmed}`}>{trimmed.slice(3)}</h2>;
  if (trimmed.startsWith("### ")) return <h3 key={`${index}-${trimmed}`}>{trimmed.slice(4)}</h3>;
  if (trimmed.startsWith("#### ")) return <h4 key={`${index}-${trimmed}`}>{trimmed.slice(5)}</h4>;
  if (trimmed === "---") return <hr key={`${index}-${trimmed}`} />;

  if (lines.every((line) => line.trim().startsWith("> "))) {
    return <blockquote key={`${index}-${trimmed}`}>{renderParagraphLines(lines.map((line) => line.trim().slice(2)).join("\n"), index)}</blockquote>;
  }

  if (lines.every((line) => line.trim().startsWith("- "))) {
    return (
      <ul className="article-list" key={`${index}-${trimmed}`}>
        {lines.map((line, lineIndex) => <li key={`${index}-${lineIndex}`}>{renderInlineContent(line.trim().slice(2), index + lineIndex)}</li>)}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
    return (
      <ol className="article-list ordered" key={`${index}-${trimmed}`}>
        {lines.map((line, lineIndex) => <li key={`${index}-${lineIndex}`}>{renderInlineContent(line.trim().replace(/^\d+\.\s+/, ""), index + lineIndex)}</li>)}
      </ol>
    );
  }

  if (lines.length >= 2 && lines[0].includes("|") && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(lines[1])) {
    return renderTable(lines, index);
  }

  return <p key={`${index}-${trimmed}`}>{renderParagraphLines(trimmed, index)}</p>;
}

export function ArticleContent({ body, className = "detail-body" }: { body: string; className?: string }) {
  const blocks = parseArticleBlocks(body);

  return (
    <div className={className}>
      {blocks.length > 0 ? blocks.map(renderArticleBlock) : <p className="article-preview-empty">暂无正文内容。</p>}
    </div>
  );
}
