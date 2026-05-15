export const dynamic = "force-dynamic";

import { db } from "@/db";
import { clients, menuCategories, menuItems, menuTemplates } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";

// This page is PUBLIC — no auth required. It's loaded by the Xibo player.
// URL: /render/[clientId]

const defaultTemplate = {
  templateStyle: "classic" as const,
  primaryColor: "#dc2626",
  secondaryColor: "#1a1a1a",
  accentColor: "#fbbf24",
  textColor: "#ffffff",
  fontFamily: "Inter",
  logoUrl: null as string | null,
  backgroundImageUrl: null as string | null,
  showPrices: true,
  showDescriptions: true,
  showImages: true,
  columns: 2,
};

export default async function MenuBoardRender({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId: cid } = await params;
  const clientId = parseInt(cid);

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId));

  if (!client) notFound();

  // Get template settings or use defaults
  const [template] = await db
    .select()
    .from(menuTemplates)
    .where(eq(menuTemplates.clientId, clientId));

  const t = template || defaultTemplate;

  // Get visible categories and items
  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.clientId, clientId))
    .orderBy(asc(menuCategories.sortOrder));

  const visibleCategories = categories.filter((c) => c.isVisible);

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.clientId, clientId))
    .orderBy(asc(menuItems.sortOrder));

  const visibleItems = items.filter((i) => i.isVisible);

  const itemsByCategory = new Map<number, typeof visibleItems>();
  for (const item of visibleItems) {
    const existing = itemsByCategory.get(item.categoryId) || [];
    existing.push(item);
    itemsByCategory.set(item.categoryId, existing);
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=1920,height=1080,initial-scale=1"
        />
        <meta httpEquiv="refresh" content="30" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Oswald:wght@400;500;600;700&family=Bebas+Neue&family=Poppins:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 1920px;
              height: 1080px;
              overflow: hidden;
              font-family: '${t.fontFamily}', sans-serif;
              background: ${t.secondaryColor};
              color: ${t.textColor};
            }
            .board {
              width: 1920px;
              height: 1080px;
              display: flex;
              flex-direction: column;
              ${t.backgroundImageUrl ? `background-image: url('${t.backgroundImageUrl}'); background-size: cover; background-position: center;` : ""}
            }
            .header {
              background: ${t.primaryColor};
              padding: 24px 48px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              min-height: 120px;
            }
            .header-logo {
              height: 80px;
              object-fit: contain;
            }
            .header-title {
              font-size: 48px;
              font-weight: 800;
              letter-spacing: -0.5px;
              text-transform: uppercase;
            }
            .content {
              flex: 1;
              display: grid;
              grid-template-columns: repeat(${t.columns}, 1fr);
              gap: 0;
              padding: 0;
            }
            .category {
              padding: 24px 32px;
              border-right: 1px solid rgba(255,255,255,0.08);
              border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .category:nth-child(even) {
              background: rgba(255,255,255,0.03);
            }
            .category-name {
              font-size: 28px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: ${t.accentColor};
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 3px solid ${t.accentColor};
              display: inline-block;
            }
            .item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 10px 0;
              border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-info {
              flex: 1;
            }
            .item-name {
              font-size: 22px;
              font-weight: 600;
            }
            .item-new {
              display: inline-block;
              background: ${t.accentColor};
              color: ${t.secondaryColor};
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 3px;
              margin-left: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              vertical-align: middle;
            }
            .item-desc {
              font-size: 14px;
              opacity: 0.6;
              margin-top: 2px;
            }
            .item-price {
              font-size: 24px;
              font-weight: 700;
              color: ${t.accentColor};
              min-width: 80px;
              text-align: right;
              padding-left: 16px;
            }
            .footer {
              background: ${t.primaryColor};
              padding: 12px 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 32px;
              font-size: 14px;
              opacity: 0.8;
            }
          `,
          }}
        />
      </head>
      <body>
        <div className="board">
          {/* Header */}
          <div className="header">
            {t.logoUrl ? (
              <img src={t.logoUrl} alt={client.name} className="header-logo" />
            ) : (
              <div className="header-title">{client.name}</div>
            )}
            {t.logoUrl && (
              <div className="header-title">{client.name}</div>
            )}
          </div>

          {/* Menu Content */}
          <div className="content">
            {visibleCategories.map((category) => {
              const catItems = itemsByCategory.get(category.id) || [];
              if (catItems.length === 0) return null;

              return (
                <div key={category.id} className="category">
                  <div className="category-name">{category.name}</div>
                  {catItems.map((item) => (
                    <div key={item.id} className="item">
                      <div className="item-info">
                        <div className="item-name">
                          {item.name}
                          {item.isNew && (
                            <span className="item-new">NEW</span>
                          )}
                        </div>
                        {t.showDescriptions && item.description && (
                          <div className="item-desc">{item.description}</div>
                        )}
                      </div>
                      {t.showPrices && (
                        <div className="item-price">${item.price}</div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="footer">
            <span>Menu prices subject to change</span>
            <span>•</span>
            <span>Ask about our daily specials</span>
          </div>
        </div>
      </body>
    </html>
  );
}
