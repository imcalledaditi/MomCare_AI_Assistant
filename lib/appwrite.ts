import { Client, Account, Databases, Storage, ID } from "appwrite";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export const BLOG_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_DATABASE_ID;
export const BLOG_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID;
const APPWRITE_PROFILE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROFILE_BUCKET_ID;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/**
 * Generate a public URL for a file in the medical bucket.
 */
export const getMedicalDocumentUrl = (fileId: string) => {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_MEDICAL_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&mode=admin`;
};

/**
 * Lists all documents from the medical bucket and maps each file to include url.
 */
export const listMedicalDocuments = async () => {
  try {
    const result = await storage.listFiles(process.env.NEXT_PUBLIC_APPWRITE_MEDICAL_BUCKET_ID);
    const mappedFiles = result.files.map((file) => ({
      ...file,
      url: getMedicalDocumentUrl(file.$id),
    }));
    return { documents: mappedFiles };
  } catch (error) {
    console.error("Error listing files:", error);
    return { documents: [] };
  }
};

/**
 * Uploads a new document (image/pdf) to the medical bucket.
 */
export const uploadMedicalDocument = async (file: File) => {
  try {
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_MEDICAL_BUCKET_ID,
      ID.unique(),
      file
    );
    return response;
  } catch (error) {
    console.error("Error uploading document:", error);
    return null;
  }
};

/**
 * Deletes a document by its file ID from the medical bucket.
 */
export const deleteMedicalDocument = async (fileId: string) => {
  try {
    return await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_MEDICAL_BUCKET_ID, fileId);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

/**
 * Creates a new user account and logs them in.
 */
export const createAccount = async (
  email: string,
  password: string,
  fullName: string,
  phone: string
) => {
  try {
    const response = await account.create(ID.unique(), email, password, fullName);
    await account.createEmailSession(email, password);
    await account.updatePhone(phone, password);
    const jwt = await account.createJWT();
    client.setJWT(jwt.jwt);
    return response;
  } catch (error) {
    console.error("Create account error:", error);
    return null;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailSession(email, password);
    const jwt = await account.createJWT();
    client.setJWT(jwt.jwt);
    return session;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    return await account.deleteSession("current");
  } catch (error) {
    console.error("Logout error:", error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Uploads a profile photo to the profile bucket.
 */
export const uploadProfilePhoto = async (file: File) => {
  try {
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedFormats.includes(file.type)) {
      throw new Error("Invalid file format. Only PNG, JPG, JPEG, and WEBP are allowed.");
    }
    const response = await storage.createFile(APPWRITE_PROFILE_BUCKET_ID, ID.unique(), file);
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

/**
 * Updates the user’s profile photo URL in their prefs.
 */
export const updateUserProfilePhoto = async (imageUrl: string) => {
  try {
    return await account.updatePrefs({ imageUrl });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return null;
  }
};