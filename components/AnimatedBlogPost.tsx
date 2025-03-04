"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Card } from "@/components/ui/card";

interface AnimatedBlogPostProps {
  post: any;
}

export function AnimatedBlogPost({ post }: AnimatedBlogPostProps) {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 w-full max-w-4xl md:max-w-5xl lg:max-w-7xl mx-auto shadow-lg">
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-4 text-gray-800 dark:text-white"
            >
              {post.title}
            </motion.h1>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 text-gray-600 dark:text-gray-300"
            >
              {/* Optionally display meta information such as published date */}
              {post.date && <span>{new Date(post.date).toLocaleDateString()}</span>}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <article className="prose sm:prose-base md:prose-lg lg:prose-xl w-full mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-4xl font-bold my-4 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-bold my-3 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-bold my-3 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="my-4 leading-relaxed text-gray-800 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-600 underline hover:text-blue-800"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc ml-6 my-2 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal ml-6 my-2 dark:text-gray-200"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          className="min-w-full table-auto border-collapse dark:text-gray-200"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border p-2 bg-gray-200 dark:bg-transparent"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border p-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
                        {...props}
                      />
                    ),
                    img: ({ node, ...props }) => (
                      <img className="w-full h-auto rounded-sm" {...props} />
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
