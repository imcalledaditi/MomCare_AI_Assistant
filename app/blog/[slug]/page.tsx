// Import dependencies
import { Client, Databases, Query } from "appwrite";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const BLOG_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

// Tell Next.js that this page does not accept unexpected dynamic params.
export const dynamicParams = false;

// Pre-generate static paths for blog posts.
// Make sure the returned params include every slug you later may navigate to.
export async function generateStaticParams() {
  try {
    const response = await databases.listDocuments(
      BLOG_DATABASE_ID,
      BLOG_COLLECTION_ID
    );
    const paths: { slug: string }[] = response.documents.map((doc: any) => ({
      slug: doc.slug,
    }));

    // If you expect a slug "there" but it isn't returned from your API,
    // manually add it.
    if (!paths.some((p) => p.slug === "there")) {
      paths.push({ slug: "there" });
    }
    return paths;
  } catch (error) {
    console.error("Error fetching blog posts for static paths:", error);
    return [];
  }
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  let post;
  try {
    const response = await databases.listDocuments(
      BLOG_DATABASE_ID,
      BLOG_COLLECTION_ID,
      [Query.equal("slug", slug)]
    );
    if (response.documents.length === 0) {
      return notFound();
    }
    post = response.documents[0];
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Card className="p-6">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4">{post.content}</p>
      </Card>
    </div>
  );
}