"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Client, Databases, ID } from "appwrite";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialize Appwrite client using environment variables
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // e.g. https://cloud.appwrite.io/v1
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Use provided default IDs if env vars are not set
const BLOG_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

export default function NewBlogPost() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setCurrentUserEmail(email);
  }, []);

  if (currentUserEmail && currentUserEmail !== "adityav1304@gmail.com") {
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
          title,       // Must match the schema field exactly
          slug,        // Must match the schema field exactly
          content,     // Must match the schema field exactly
          author: currentUserEmail,
          createdAt: new Date().toISOString(),
        }
      );
      toast.success("Blog post created successfully!");
      router.push(`/blog/${slug}`);
    } catch (err: any) {
      console.error("Error creating blog post:", err);
      setError("Failed to create blog post.");
      toast.error("Failed to create blog post.");
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
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post Blog
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}