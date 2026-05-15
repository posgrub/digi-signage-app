const XIBO_CMS_URL = process.env.XIBO_CMS_URL!;
const XIBO_CLIENT_ID = process.env.XIBO_CLIENT_ID!;
const XIBO_CLIENT_SECRET = process.env.XIBO_CLIENT_SECRET!;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const res = await fetch(`${XIBO_CMS_URL}/api/authorize/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: XIBO_CLIENT_ID,
      client_secret: XIBO_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Xibo auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

// Xibo API uses form-urlencoded for POST/PUT, not JSON
function toForm(data: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(`${key}[]`, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
  }
  return params;
}

async function xiboGet(path: string): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${XIBO_CMS_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function xiboPost(
  path: string,
  data: Record<string, unknown> = {}
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${XIBO_CMS_URL}/api${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toForm(data),
  });
}

async function xiboPut(
  path: string,
  data: Record<string, unknown> = {}
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${XIBO_CMS_URL}/api${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toForm(data),
  });
}

async function xiboDelete(path: string): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${XIBO_CMS_URL}/api${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const xibo = {
  // Displays
  async getDisplays() {
    return (await xiboGet("/display")).json();
  },
  async getDisplay(id: number) {
    return (await xiboGet(`/display/${id}`)).json();
  },
  async authorizeDisplay(id: number) {
    return (await xiboPut(`/display/authorise/${id}`)).json();
  },
  async setDefaultLayout(displayId: number, layoutId: number) {
    return (await xiboPut(`/display/defaultlayout/${displayId}`, { layoutId })).json();
  },

  // Display Groups
  async getDisplayGroups() {
    return (await xiboGet("/displaygroup")).json();
  },
  async createDisplayGroup(displayGroup: string, description?: string) {
    return (await xiboPost("/displaygroup", { displayGroup, description })).json();
  },
  async assignDisplayToGroup(groupId: number, displayId: number) {
    return (await xiboPost(`/displaygroup/${groupId}/display/assign`, { id: [displayId] })).json();
  },

  // Folders
  async getFolders() {
    return (await xiboGet("/folder")).json();
  },
  async createFolder(text: string, parentId?: number) {
    return (await xiboPost("/folder", { text, parentId })).json();
  },

  // Users
  async getUsers() {
    return (await xiboGet("/user")).json();
  },
  async createUser(user: {
    userName: string;
    password: string;
    email: string;
    userTypeId: number;
    homePageId?: number;
  }) {
    return (await xiboPost("/user", user)).json();
  },

  // Layouts
  async getLayouts() {
    return (await xiboGet("/layout")).json();
  },

  // Media Library
  async getMedia() {
    return (await xiboGet("/library")).json();
  },
  async uploadMedia(formData: FormData) {
    const token = await getAccessToken();
    const res = await fetch(`${XIBO_CMS_URL}/api/library`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  // Schedules
  async getSchedules() {
    return (await xiboGet("/schedule")).json();
  },

  // Menu Boards
  async getMenuBoards() {
    return (await xiboGet("/menuboard")).json();
  },
  async createMenuBoard(name: string) {
    return (await xiboPost("/menuboard", { name })).json();
  },
  async getMenuBoard(id: number) {
    return (await xiboGet(`/menuboard/${id}`)).json();
  },

  // Menu Board Categories
  async createMenuBoardCategory(menuBoardId: number, data: { name: string }) {
    return (await xiboPost(`/menuboard/${menuBoardId}/category`, data)).json();
  },
  async updateMenuBoardCategory(categoryId: number, data: { name?: string }) {
    return (await xiboPut(`/menuboard/category/${categoryId}`, data)).json();
  },

  // Menu Board Products
  async createMenuBoardProduct(
    categoryId: number,
    data: {
      name: string;
      description?: string;
      price: string;
      allergyInfo?: string;
      availability?: number;
    }
  ) {
    return (await xiboPost(`/menuboard/category/${categoryId}/product`, data)).json();
  },
  async updateMenuBoardProduct(
    productId: number,
    data: {
      name?: string;
      description?: string;
      price?: string;
      allergyInfo?: string;
      availability?: number;
    }
  ) {
    return (await xiboPut(`/menuboard/product/${productId}`, data)).json();
  },
  async deleteMenuBoardProduct(productId: number) {
    return (await xiboDelete(`/menuboard/product/${productId}`)).json();
  },
};
