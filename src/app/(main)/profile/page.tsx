// src/app/profile/manage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ManageProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [, setProfileImage] = useState<string>(""); // URL from DB
  const [file, setFile] = useState<File | null>(null); // Local file
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null); // Image preview

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setName(data.name);
        setProfileImage(data.profileImage || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string); // Preview the image
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (file) formData.append("profileImage", file);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setProfileImage(updatedUser.profileImage || "");
        setFile(null);
        setPreview(null);
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred");
    }
  };

  if (!session) return <p>Please log in</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium">
            Profile Image
          </label>

          {preview && (
            <div className="mt-2">
              <Image
                src={preview}
                alt="Preview"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          )}
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
