"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { getCurrentUser, uploadProfilePhoto, updateUserProfilePhoto } from "@/lib/appwrite";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface Profile {
  name: string;
  dob: string;
  address: string;
  email: string;
  phone: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setProfile({
            name: user.name || "",
            dob: user.prefs?.dob || "",
            address: user.prefs?.address || "",
            email: user.email || "",
            phone: user.phone || "", // Ensure phone is fetched
            imageUrl: user.prefs?.imageUrl || ""
          });
          setImagePreview(user.prefs?.imageUrl || null);
        } else {
          setProfile(null);
        }
      } catch (error) {
        toast.error("Error loading profile.");
        console.error("Error loading profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);  

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedFormats.includes(file.type)) {
        toast.error("Invalid file format. Only PNG, JPG, JPEG, and WEBP are allowed.");
        return;
      }

      setUploading(true);
      toast.info("Uploading profile picture...");
      
      const uploadResponse = await uploadProfilePhoto(file);
      if (uploadResponse && uploadResponse.$id) {
        const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_PROFILE_BUCKET_ID}/files/${uploadResponse.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
        console.log("Uploaded file URL:", fileUrl);
        setImagePreview(fileUrl);
        
        const updatedUser = await updateUserProfilePhoto(fileUrl);
        if (updatedUser) {
          setProfile(prev => prev ? { ...prev, imageUrl: fileUrl } : prev);
          toast.success("Profile picture updated successfully!");
        }
      } else {
        toast.error("Failed to upload profile picture.");
      }
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading profile...</p>;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Wrong Credentials. Please check your details and try again.</p>
          <Link href="/login">
            <Button className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-500 transition duration-200">
              Login
            </Button>
          </Link>
          <p className="text-gray-600">
            New here?{" "}
            <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-2xl font-bold text-center">Your Profile</h2>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-4">
            {imagePreview || profile.imageUrl ? (
              <img
                src={imagePreview || profile.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  (e.currentTarget as HTMLImageElement).onerror = null;
                  setImagePreview(null);
                  toast.error("Failed to load profile image.");
                }}
              />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
          </div>
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload Profile Image"}
          </Button>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
        <div className="space-y-2">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>DOB:</strong> {profile.dob}</p>
          <p><strong>Gender:</strong> Female</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => toast.info("Update profile logic goes here.")}
        >
          Update Profile
        </Button>
      </Card>
    </div>
  );
}
