import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-60 bg-slate-200 dark:bg-white/5 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-white/5 rounded-lg" />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded-md" />
              <div className="h-5 w-5 bg-slate-200 dark:bg-white/5 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 w-24 bg-slate-200 dark:bg-white/5 rounded-lg" />
              <div className="h-3 w-40 bg-slate-200 dark:bg-white/5 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5" />
        <div className="h-[350px] bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5" />
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-36 bg-slate-200 dark:bg-white/5 rounded-md" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded-md" />
        </div>

        <Card className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/2">
                <TableRow className="border-slate-200 dark:border-white/10">
                  <TableHead className="w-24"><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" /></TableHead>
                  <TableHead><div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded" /></TableHead>
                  <TableHead><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded" /></TableHead>
                  <TableHead><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" /></TableHead>
                  <TableHead><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded" /></TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <TableRow key={idx} className="border-slate-100 dark:border-white/5">
                    <TableCell><div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded" />
                        <div className="h-3 w-40 bg-slate-200 dark:bg-white/5 rounded" />
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-200 dark:bg-white/5 rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-slate-200 dark:bg-white/5 rounded-lg" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
