"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, ExternalLink, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Company = {
  id: string;
  name: string;
  adminEmail: string;
  address: string;
  logo: string;
  licenseUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");
      const data = await response.json();
      setCompanies(data.companies);
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusUpdate = async (
    companyId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(companyId);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Company ${status.toLowerCase()} successfully`);

      // Update local state
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId ? { ...company, status } : company
        )
      );
    } catch {
      toast.error("Failed to update company status");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: Company["status"]) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const pendingCompanies = companies.filter(
    (company) => company.status === "PENDING"
  );
  const otherCompanies = companies.filter(
    (company) => company.status !== "PENDING"
  );

  return (
    <div className="space-y-6">
      {/* Pending Approvals Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-yellow-600" />
            Pending Approvals
          </CardTitle>
          <Badge variant="outline" className="bg-yellow-50">
            {pendingCompanies.length} pending
          </Badge>
        </CardHeader>
        <CardContent>
          {pendingCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending company approvals
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {company.logo ? (
                            <Image
                              src={company.logo}
                              alt={company.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <span>{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.adminEmail}</TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell>
                        <a
                          href={company.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          View License <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </TableCell>
                      <TableCell>
                        {new Date(company.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(company.id, "APPROVED")
                            }
                            disabled={processingId === company.id}
                          >
                            {processingId === company.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(company.id, "REJECTED")
                            }
                            disabled={processingId === company.id}
                          >
                            {processingId === company.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Companies Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-green-600" />
            All Companies
          </CardTitle>
          <Badge variant="outline" className="bg-green-50">
            {companies.length} total
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span>{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{company.adminEmail}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>{getStatusBadge(company.status)}</TableCell>
                    <TableCell>
                      {new Date(company.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
