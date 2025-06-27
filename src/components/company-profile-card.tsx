import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Building2, Mail, MapPin, FileText, Clock } from "lucide-react";

interface CompanyProfile {
  id: string;
  name: string;
  adminEmail: string;
  address: string;
  logo: string;
  licenseUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface CompanyProfileCardProps {
  profile: CompanyProfile;
}

export function CompanyProfileCard({ profile }: CompanyProfileCardProps) {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-green-800">
          Company Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-100">
              {profile.logo ? (
                <Image
                  src={profile.logo}
                  alt={`${profile.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Company Details */}
          <div className="flex-grow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="font-medium">Company Name:</span>
                </div>
                <p className="text-gray-800 ml-6">{profile.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="font-medium">Admin Email:</span>
                </div>
                <p className="text-gray-800 ml-6">{profile.adminEmail}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">Address:</span>
                </div>
                <p className="text-gray-800 ml-6">{profile.address}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">Member Since:</span>
                </div>
                <p className="text-gray-800 ml-6">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="font-medium">Business License:</span>
                </div>
                <a
                  href={profile.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-6 inline-flex items-center"
                >
                  View License
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
