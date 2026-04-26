export enum Permission {
  UserCreate = 'user.create',
  UserEdit = 'user.edit',
  IdentityAccess = 'identity.access',

  CatalogCreate = 'catalog.create',
  CatalogEdit = 'catalog.edit',
  ProductCreate = 'product.create',
  ProductEdit = 'product.edit',
  ProductDelete = 'product.delete',

  WarehouseCreate = 'warehouse.create',
  WarehouseUpdate = 'warehouse.update',
  WarehouseStockRemove = 'warehouse.stock.remove',
  WarehouseStockMovements = 'warehouse.stock.movements',
  WarehouseStockAdjustment = 'warehouse.stock.adjustment',
}
