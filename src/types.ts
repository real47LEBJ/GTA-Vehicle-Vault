/**
 * 品牌类型定义
 */
export interface Brand {
  id: string;
  brand: string;
  brand_en: string;
}

/**
 * 载具类型定义
 */
export interface Vehicle {
  id: string;
  brand_id: string;
  vehicle_name: string;
  vehicle_name_en: string;
  vehicle_type: string;
  feature: string;
  price: number;
  remarks?: string;
}

/**
 * 车库载具类型定义
 */
export interface GarageVehicle {
  id: string;
  vehicleName: string;
  vehicleNameEn: string;
  brandName: string;
  brandNameEn: string;
  feature: string;
  price: number;
  vehicle_type: string;
  remarks: string;
}

/**
 * 车库类型定义
 */
export interface Garage {
  id: number;
  storageName: string;
  num: number;
  vehicleList: GarageVehicle[];
  remarks?: string;
  order?: number;
}

/**
 * API响应类型定义
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
