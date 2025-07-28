// This file is deprecated. Use useTypedDatabase instead.
// Keeping this file to avoid breaking imports, but redirecting to typed hooks.

export { 
  useProductionOrders,
  useProductionSteps,
  useDeliveries,
  useDeliveryItems,
  useProducts,
  useBrickTypes,
  useProductionMaterials,
  useProductionRecipes,
  useProductionCosts,
  useMonthlyGoals,
  useAccountingCategories,
  useAccountingEntries,
  useAppSettings
} from './useTypedDatabase';
