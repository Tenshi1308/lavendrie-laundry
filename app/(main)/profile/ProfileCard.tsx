"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Calendar, Edit, LogOut, Phone } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/logout-action";

interface ProfileCardClientProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    phone: string;
    role: string;
    memberSince: string;
  };
}

export function ProfileCardClient({ user }: ProfileCardClientProps) {
  const [open, setOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <Link href="/profile/edit" passHref>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar dengan klik */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => user.avatar && setOpen(true)}
              className={`relative ${user.avatar ? "cursor-pointer" : "cursor-default"}`}
              disabled={!user.avatar}
              title={user.avatar ? "Klik untuk melihat" : "Tidak ada foto profil"}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </button>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <Badge variant="secondary">
                {user.role === "admin" ? "Admin" : "Customer"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member sejak:</span>
              <span>{user.memberSince}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nomor Telepon:</span>
              <span>{user.phone}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Ver. 1.3.9
              </p>
              <form action={logout}>
                <Button type="submit" size="sm" variant="ghost" className="flex items-center gap-1 hover:bg-red-500 hover:text-white">
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-transparent border-gray-500 backdrop-blur-sm shadow-none w-screen h-auto p-0 m-0 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">Foto Profil {user.name}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar}
              alt={`Foto profil ${user.name}`}
              className="max-w-auto max-h-[70vh] object-contain px-6 pb-6"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}