export const UNITS_CONVERSION = {
  // Volume: base unit is ml
  'l_ml': 1000,
  'ml_l': 0.001,
  'cups_ml': 240,
  'ml_cups': 1 / 240,
  'tbsp_ml': 15,
  'ml_tbsp': 1 / 15,
  'tsp_ml': 5,
  'ml_tsp': 1 / 5,
  'oz_ml': 29.5735,
  'ml_oz': 1 / 29.5735,

  // Weight: base unit is g
  'kg_g': 1000,
  'g_kg': 0.001,
  'lb_g': 453.592,
  'g_lb': 1 / 453.592,
  'oz_g': 28.3495,
  'g_oz': 1 / 28.3495,
};

export function convertQuantity(qty, fromUnit, toUnit) {
  if (!qty) return 0;
  if (!fromUnit || !toUnit || fromUnit.toLowerCase() === toUnit.toLowerCase()) return qty;

  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  // Direct conversion
  const directKey = `${from}_${to}`;
  if (UNITS_CONVERSION[directKey] !== undefined) {
    return qty * UNITS_CONVERSION[directKey];
  }

  // Multi-step conversion via base units
  const volumeUnits = ['ml', 'l', 'cups', 'tbsp', 'tsp', 'oz'];
  const weightUnits = ['g', 'kg', 'lb', 'oz'];

  if (volumeUnits.includes(from) && volumeUnits.includes(to)) {
    let qtyInMl = qty;
    if (from !== 'ml') {
      const toMlKey = `${from}_ml`;
      qtyInMl = UNITS_CONVERSION[toMlKey] !== undefined ? qty * UNITS_CONVERSION[toMlKey] : qty;
    }
    if (to === 'ml') return qtyInMl;
    const fromMlKey = `ml_${to}`;
    return UNITS_CONVERSION[fromMlKey] !== undefined ? qtyInMl * UNITS_CONVERSION[fromMlKey] : qtyInMl;
  }

  if (weightUnits.includes(from) && weightUnits.includes(to)) {
    let qtyInG = qty;
    if (from !== 'g') {
      const toGKey = `${from}_g`;
      qtyInG = UNITS_CONVERSION[toGKey] !== undefined ? qty * UNITS_CONVERSION[toGKey] : qty;
    }
    if (to === 'g') return qtyInG;
    const fromGKey = `g_${to}`;
    return UNITS_CONVERSION[fromGKey] !== undefined ? qtyInG * UNITS_CONVERSION[fromGKey] : qtyInG;
  }

  return qty;
}

export function calculateIngredientCost(ingredient, product) {
  if (!product) return 0;
  const productCost = Number(product.cost) || 0;
  const ingredientQty = Number(ingredient.quantity_per_batch) || 0;
  const convertedQty = convertQuantity(ingredientQty, ingredient.unit, product.unit);
  return convertedQty * productCost;
}

export function calculateRecipeCostDetails(recipe, products) {
  const ingredients = recipe.ingredients || [];
  let totalBatchCost = 0;

  const ingredientCosts = ingredients.map(ing => {
    const prod = products.find(p => p.id === ing.product_id);
    const cost = calculateIngredientCost(ing, prod);
    totalBatchCost += cost;
    return {
      ...ing,
      cost,
      unitCost: prod?.cost || 0,
      productUnit: prod?.unit || ing.unit,
    };
  });

  const yieldQty = Number(recipe.yield_quantity) || 1;
  const costPerServing = totalBatchCost / yieldQty;

  const finishedProd = products.find(p => p.id === recipe.product_id);
  const sellingPrice = finishedProd ? Number(finishedProd.price) : 0;
  const profitPerServing = sellingPrice > 0 ? sellingPrice - costPerServing : 0;
  const profitMargin = sellingPrice > 0 ? (profitPerServing / sellingPrice) * 100 : 0;

  return {
    ingredientCosts,
    totalBatchCost,
    costPerServing,
    sellingPrice,
    profitPerServing,
    profitMargin,
  };
}
