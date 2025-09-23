import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function MarkdownRenderer({ children }) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
                h1({ children, ...props }) {
                    return (
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.75rem 0" }} {...props}>
                            {children}
                        </h1>
                    );
                },
                h2({ children, ...props }) {
                    return (
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.75rem 0" }} {...props}>
                            {children}
                        </h2>
                    );
                },
                h3({ children, ...props }) {
                    return (
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0.5rem 0" }} {...props}>
                            {children}
                        </h3>
                    );
                },
                ul({ children, ...props }) {
                    return (
                        <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", margin: "0.5rem 0" }} {...props}>
                            {children}
                        </ul>
                    );
                },
                ol({ children, ...props }) {
                    return (
                        <ol style={{ listStyleType: "decimal", paddingLeft: "1.25rem", margin: "0.5rem 0" }} {...props}>
                            {children}
                        </ol>
                    );
                },
                code({ inline, className, children: codeChildren, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={dracula}
                            PreTag="div"
                            language={match[1]}
                            {...props}
                        >
                            {String(codeChildren).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {codeChildren}
                        </code>
                    );
                },

                p({ children, ...props }) {
                    return (
                        <p
                            style={{ marginBottom: "0.9rem" }}
                            {...props}
                        >
                            {children}
                        </p>
                    );
                },
                a({ children, ...props }) {
                    return (
                        <a style={{ color: "var(--accent)" }} {...props}>
                            {children}
                        </a>
                    );
                },
                img({ ...props }) {
                    return (
                        <img style={{ maxWidth: "100%" }} {...props} />
                    );
                },

                blockquote({ children, ...props }) {
                    return (
                        <blockquote style={{ margin: "0.5rem 0", paddingLeft: "1.25rem", borderLeft: "2px solid var(--accent)" }} {...props}>
                            {children}
                        </blockquote>
                    );
                },
                hr({ ...props }) {
                    return (
                        <hr style={{ margin: "0.5rem 0" }} {...props} />
                    );
                },

                table({ children, ...props }) {
                    return (
                        <table style={{ width: "100%", borderCollapse: "collapse", margin: "0.5rem 0" }} {...props}>
                            {children}
                        </table>
                    );
                },
                th({ children, ...props }) {
                    return (
                        <th style={{ border: "1px solid var(--border)", padding: "0.25rem 0.5rem", textAlign: "left" }} {...props}>
                            {children}
                        </th>
                    );
                },
                td({ children, ...props }) {
                    return (
                        <td style={{ border: "1px solid var(--border)", padding: "0.25rem 0.5rem", textAlign: "left" }} {...props}>
                            {children}
                        </td>
                    );
                },
                br({ ...props }) {
                    return (
                        <br style={{ margin: "0.5rem 0" }} {...props} />
                    );
                },
            }}
        >
            {children}
        </Markdown>
    );
}