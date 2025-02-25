"use client";

import { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const BLOG_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

export default function Resources() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await databases.listDocuments(
          BLOG_DATABASE_ID,
          BLOG_COLLECTION_ID
        );
        setBlogs(response.documents);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading blogs...</p>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Blog Resources</h1>
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        {filteredBlogs.length === 0 ? (
          <p className="text-center">No blogs posted.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredBlogs.map((blog) => (
              <Card key={blog.$id} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4">
                  {blog.content.substring(0, 100)}...
                </p>
                <Link href={`/blog/${blog.slug}`} legacyBehavior>
                  <a className="text-blue-500 hover:underline">Read More</a>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}