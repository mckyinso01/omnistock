import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const imageUrl = body?.image_url;
    if (!imageUrl) {
      return Response.json({ error: "Missing image_url." }, { status: 400 });
    }

    const prompt = `You are an expert OCR + retail catalog analyst specialized in deciphering MESSY HANDWRITTEN price lists and supplier catalogues.

The attached image is a photo of a paper catalogue (possibly handwritten). Extract EVERY product line you can identify into structured data.

For each product entry, capture:
- name: the product name (REQUIRED — always provide your best guess even if partially readable)
- sku: any SKU or product code ("" if none)
- barcode: any barcode number ("" if none)
- price: the selling price (number, 0 if missing — strip currency symbols like ₱ or $)
- cost: the cost/buy price if present (number, 0 if missing)
- quantity: the stock quantity if present (number, 0 if missing)
- unit: the unit of measure, e.g. pcs, mL, L, g, kg, pack, box, bottle, can, sachet, set. Default to "pcs" if unclear.
- category: infer a sensible category from the product name (e.g. "Beverages", "Snacks", "Stationery", "Personal Care") if not explicitly written
- low_stock_threshold: estimate a sensible reorder threshold (default 10 if missing)
- confidence: your confidence score (0.0 to 1.0) for how clearly you could read THIS row
- notes: short note on any ambiguity (e.g. "price digit unclear — could be 12 or 17" or "" if confident)

Rules:
- Do NOT skip entries. If a row is barely legible, set confidence low (e.g. 0.3) and put your best-guess interpretation in name with an explanatory note.
- All prices and quantities MUST be numbers (no currency symbols or units in those fields).
- Return ALL products in a single JSON object: {"products": [...]}.
- If no recognizable products, return {"products": []}.`;

    const schema = {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              sku: { type: "string" },
              barcode: { type: "string" },
              price: { type: "number" },
              cost: { type: "number" },
              quantity: { type: "number" },
              category: { type: "string" },
              unit: { type: "string" },
              low_stock_threshold: { type: "number" },
              confidence: { type: "number" },
              notes: { type: "string" }
            },
            required: ["name"]
          }
        }
      },
      required: ["products"]
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [imageUrl],
      response_json_schema: schema,
      model: "claude_sonnet_4_6"
    });

    const raw = Array.isArray(result?.products) ? result.products : (Array.isArray(result) ? result : []);
    const products = raw.map((p, i) => ({
      name: String(p.name || "").trim(),
      sku: p.sku ? String(p.sku) : "",
      barcode: p.barcode ? String(p.barcode) : "",
      price: Number(p.price) || 0,
      cost: Number(p.cost) || 0,
      quantity: Number(p.quantity) || 0,
      category: p.category ? String(p.category) : "",
      unit: p.unit ? String(p.unit) : "pcs",
      low_stock_threshold: Number(p.low_stock_threshold) || 10,
      confidence: typeof p.confidence === "number" ? p.confidence : 0.5,
      notes: p.notes ? String(p.notes) : ""
    })).filter(p => p.name);

    return Response.json({ ok: true, products, count: products.length, source_image_url: imageUrl });
  } catch (err) {
    return Response.json({ error: err.message || "scan failed" }, { status: 500 });
  }
});