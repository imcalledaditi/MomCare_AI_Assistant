"use client"

import { useState, useEffect } from "react";
import { Client, Databases, Query } from "appwrite";
import { Card } from "@/components/ui/card";
import { notFound, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { account } from "@/lib/appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const BLOG_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

export default function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userName, setUserName] = useState("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        const user = await account.get();
        setUserName(user.name);
      } catch (error) {
        console.error("Authentication failed:", error);
        toast.error("Please login to access blog posts");
        router.push('/login');
        return;
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch blog post data
  useEffect(() => {
    const fetchPost = async () => {
      if (isAuthChecking) return; // Don't fetch if still checking auth
      
      setLoading(true);
      try {
        const response = await databases.listDocuments(
          BLOG_DATABASE_ID,
          BLOG_COLLECTION_ID,
          [Query.equal("slug", slug)]
        );
        if (response.documents.length === 0) {
          router.push('/404');
          return;
        }
        setPost(response.documents[0]);
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Failed to load blog post");
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, isAuthChecking, router]);

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  // Show loading state while fetching the post
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading blog post...</p>
      </div>
    );
  }

  // Show post if available
  if (post) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="mb-4 text-gray-600 overflow-x-auto">
            <article className="prose sm:prose-base md:prose-lg lg:prose-xl w-full mx-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-4xl font-bold my-4 dark:text-gray-200" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold my-3 dark:text-gray-200" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold my-3 dark:text-gray-200" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-4 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-blue-600 underline hover:text-blue-800" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-6 my-2 dark:text-gray-200" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-6 my-2 dark:text-gray-200" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full table-auto border-collapse dark:text-gray-200" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border p-2 bg-gray-200 dark:bg-transparent" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border p-2" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>
          </div>
        </Card>
        <ToastContainer />
      </div>
    );
  }

  return null;
}