"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BsArrowRight } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";

export default function CreateCompanyPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [, setLogo] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogo(`/${file.name}`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string); // Base64 data URL for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) formData.append("logo", logoFile);
    formData.append("about", about);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setName("");
        setLogoFile(null);
        setLogo("");
        setLogoPreview(null);
        setAbout("");
        setEmail("");
        setPassword("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create company");
      }
    } catch (error) {
      console.error("Create company error:", error);
      setError("An unexpected error occurred");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[600px] p-12">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Create Company Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {logoPreview && (
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-full"
                  width={128}
                  height={128}
                />
              )}
            </div>
            <Textarea
              placeholder="About the Company"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="min-h-[100px]"
            />
            <hr className="text-gray-500"></hr>
            <h1 className="flex mb-4 justify-center">Create Company Account</h1>
            <Input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="flex items-center justify-between bg-green-600 hover:bg-green-700 "
            >
              Create Company <BsArrowRight />
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Go{" "}
            <Link
              href="/dashboard/admin"
              className="text-blue-500 hover:underline"
            >
              Back
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
