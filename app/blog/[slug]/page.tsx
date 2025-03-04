import { notFound } from "next/navigation";
import { Client, Databases, Query } from "appwrite";
import { AnimatedBlogPost } from "@/components/AnimatedBlogPost";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const BLOG_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
const BLOG_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;

export async function generateStaticParams() {
  try {
    const response = await databases.listDocuments(
      BLOG_DATABASE_ID,
      BLOG_COLLECTION_ID
    );
    const paths: { slug: string }[] = response.documents.map((doc: any) => ({
      slug: doc.slug,
    }));

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

  return <AnimatedBlogPost post={post} />;
}
