"use client";

import { useState, useEffect } from "react";
import { Client, Databases } from "appwrite";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const BLOG_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

export default function Resources() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
        fetchBlogs();
      } catch (error) {
        console.error("Authentication error:", error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Function to fetch blogs directly from Appwrite
  const fetchBlogs = async () => {
    try {
      const response = await databases.listDocuments(
        BLOG_DATABASE_ID,
        BLOG_COLLECTION_ID
      );
      console.log("Fetched blogs from Appwrite:", response.documents);
      setBlogs(response.documents);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription to listen for changes in the blogs collection
  useEffect(() => {
    // The subscribe method returns an unsubscribe function
    const unsubscribe = client.subscribe(
      `collections.${BLOG_COLLECTION_ID}.documents`,
      (response) => {
        console.log("Realtime update received:", response);
        // Fetch latest data when a change is detected
        fetchBlogs();
      }
    );

    // Cleanup: call the unsubscribe function when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-12 h-12 border-b-2 border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to access resources.</p>
      </div>
    );
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
              <motion.div
                key={blog.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                  <div className="text-sm text-gray-500 mb-2">
                    By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                  <div className="prose mb-4">
                  <ReactMarkdown
  components={{
    img: () => null, // Prevent rendering images
  }}
>
  {blog.content.substring(0, 200) + '...'}
</ReactMarkdown>

                  </div>
                  <Link href={`/blog/${blog.slug}`} legacyBehavior>
                    <a className="inline-block bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow transition-colors duration-200">
                      Read More
                    </a>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
