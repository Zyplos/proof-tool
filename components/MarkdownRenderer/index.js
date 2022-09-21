/* eslint-disable react/no-children-prop */
// https://github.com/remarkjs/react-markdown#use-remark-and-rehype-plugins-math
import React from "react";
import ReactDom from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

export default function MarkdownRenderer({ content }) {
  return <ReactMarkdown children={content} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />;
}
