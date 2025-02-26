"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { 
  listMedicalDocuments,
  uploadMedicalDocument,
  deleteMedicalDocument,
  getCurrentUser
} from "@/lib/appwrite";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MedicalDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        fetchDocuments();
      } catch (error) {
        console.error("Authentication error:", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchDocuments = async () => {
    try {
      const docs = await listMedicalDocuments();
      setDocuments(docs.documents || []);
    } catch (error: any) {
      toast.error("Failed to list documents.");
      console.error("List documents error:", error);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const allowedFormats = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedFormats.includes(file.type)) {
      toast.error("Only PNG, JPEG, and PDF files are allowed.");
      return;
    }

    setUploading(true);
    toast.info("Uploading document...");
    const result = await uploadMedicalDocument(file);

    if (result) {
      toast.success("Document uploaded successfully!");
      fetchDocuments();
    } else {
      toast.error("Failed to upload document.");
    }
    setUploading(false);
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteMedicalDocument(docId);
      toast.success("Document deleted successfully!");
      fetchDocuments();
    } catch (error: any) {
      toast.error("Failed to delete document.");
      console.error("Delete document error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to access your medical documents.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-4 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {documents.length > 0 && (
        <Button
          className="mb-6"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      )}
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      {documents.length === 0 ? (
        <Card className="max-w-xl w-full p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Medical Documents</h2>
          <div className="flex flex-col items-center space-y-4">
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
          <p className="text-center mt-4">No documents uploaded.</p>
        </Card>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {documents.map((doc, index) => (
            <motion.div 
              key={doc.$id} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="dark:bg-slate-800 p-4 flex flex-col items-center rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105 hover:shadow-xl">
                {doc.mimeType.startsWith("image/") ? (
                  <Image
                    src={doc.url}
                    alt={doc.name}
                    width={180}
                    height={180}
                    className="cursor-pointer rounded-lg object-cover w-full h-40"
                    onClick={() => {
                      setCurrentIndex(index);
                      setLightboxOpen(true);
                    }}
                  />
                ) : doc.mimeType === "application/pdf" ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-40 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                  >
                    PDF Preview
                  </a>
                ) : (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-2 text-primary hover:underline"
                  >
                    {doc.name}
                  </a>
                )}
                <Button className="mt-3 w-full" variant="destructive" onClick={() => handleDelete(doc.$id)}>
                  Delete
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={currentIndex}
          slides={documents
            .filter((doc) => doc.mimeType.startsWith("image/"))
            .map((doc) => ({ src: doc.url }))}
        />
      )}
    </motion.div>
  );
}