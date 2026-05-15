export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { promos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Megaphone, Calendar, Clock } from "lucide-react";
import { updatePromoStatus, deletePromo } from "@/lib/actions/promos";
import { getActiveClientId } from "@/lib/scope";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline", scheduled: "secondary", active: "default", expired: "outline", cancelled: "destructive",
};
const typeLabels: Record<string, string> = {
  daily_special: "Daily Special", happy_hour: "Happy Hour", event: "Event",
  announcement: "Announcement", advertisement: "Ad", seasonal: "Seasonal",
};

export default async function PromosPage() {
  const { clientId, clientName } = await getActiveClientId();
  if (!clientId) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Promos & Specials</h2>
        <Card className="border-dashed mt-6"><CardContent className="py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No restaurant configured.</p>
        </CardContent></Card>
      </div>
    );
  }

  const allPromos = await db.select().from(promos).where(eq(promos.clientId, clientId)).orderBy(desc(promos.createdAt));
  const active = allPromos.filter((p) => p.status === "active");
  const scheduled = allPromos.filter((p) => p.status === "scheduled");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Promos & Specials</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {clientName} — {active.length} active, {scheduled.length} scheduled
          </p>
        </div>
        <Link href="/promos/new">
          <Button className="bg-copper text-copper-foreground hover:bg-copper/90">
            <Plus className="h-4 w-4 mr-1.5" />New Promo
          </Button>
        </Link>
      </div>

      {allPromos.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No promotions yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Create daily specials, happy hour promos, or advertisements.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Title</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">Schedule</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPromos.map((promo) => {
                const activateAction = updatePromoStatus.bind(null, promo.id, "active");
                const cancelAction = updatePromoStatus.bind(null, promo.id, "cancelled");
                const delAction = deletePromo.bind(null, promo.id);
                return (
                  <TableRow key={promo.id} className="border-border/30 hover:bg-accent/50">
                    <TableCell><Badge variant={statusColors[promo.status]} className="text-[10px]">{promo.status}</Badge></TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium">{promo.title}</span>
                        {promo.description && <p className="text-[11px] text-muted-foreground truncate max-w-xs">{promo.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] font-normal bg-muted/80">{typeLabels[promo.promoType] || promo.promoType}</Badge></TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {promo.startDate && <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{promo.startDate}{promo.endDate && ` → ${promo.endDate}`}</div>}
                        {promo.startTime && <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{promo.startTime}{promo.endTime && ` – ${promo.endTime}`}</div>}
                        {promo.daysOfWeek && <span className="font-mono text-[10px]">{promo.daysOfWeek}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(promo.status === "draft" || promo.status === "scheduled") && (
                          <form action={activateAction}><Button type="submit" size="sm" variant="outline" className="h-7 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">Activate</Button></form>
                        )}
                        {promo.status === "active" && (
                          <form action={cancelAction}><Button type="submit" size="sm" variant="outline" className="h-7 text-xs">Stop</Button></form>
                        )}
                        <form action={delAction}><Button type="submit" size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-destructive">Delete</Button></form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
