// Language: TSX
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Client, Databases, ID } from "appwrite";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCurrentUser } from "@/lib/appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const BLOG_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

interface User {
  name: string;
  email: string;
}

export default function NewBlogPost() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preview, setPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchUser();
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Authorization check based on email (only allow adityav1304@gmail.com)
  if (currentUser.email !== "adityav1304@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You are not authorized to post blogs.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databases.createDocument(
        BLOG_DATABASE_ID,
        BLOG_COLLECTION_ID,
        ID.unique(),
        {
          title,                       // Must match the schema field exactly
          slug,                        // Must match the schema field exactly
          content,                     // Must match the schema field exactly
          author: currentUser.name,    // Automatically taken from the logged-in user
          createdAt: new Date().toISOString(), // Current date & time stamp
        }
      );
      toast.success("Blog post created successfully!");
      router.push(`/blog/${slug}`);
    } catch (err: any) {
      console.error("Error creating document:", err);
      setError("Failed to create document.");
      toast.error("Failed to create document.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {error && <div className="text-red-500">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content (supports Markdown formatting, e.g. **bold**)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            {preview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Post Blog
          </button>
        </div>
        {preview && (
          <div className="mt-6 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-2">Markdown Preview:</h2>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </form>
      <ToastContainer />
    </div>
  );
}