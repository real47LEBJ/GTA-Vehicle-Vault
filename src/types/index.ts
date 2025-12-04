/**
 * Application Type Definitions
 */

// Theme types
export type Theme = "light" | "dark" | "system";
export type ActualTheme = "light" | "dark";

// Form validation types
export interface FormErrors<_T> {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

// Component props base types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Button variants and sizes
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning";
export type ButtonSize = "small" | "medium" | "large";

// Input variants and sizes
export type InputVariant = "default" | "error" | "success";
export type InputSize = "small" | "medium" | "large";

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Vehicle management types
export interface Brand {
  id: string;
  brand: string;
  brand_en: string;
}

export interface Vehicle {
  id: string;
  brand_id: string;
  vehicle_name: string;
  vehicle_name_en: string;
  feature: string;
}

export interface BrandWithVehicles extends Brand {
  vehicleList: Vehicle[];
}

// Garage management types
export interface GarageVehicle {
  vehicleName: string;
  brandName: string;
  vehicleNameEn: string;
  brandNameEn: string;
  remarks: string;
  feature: string;
  plate?: string;
  id?: string;
}

export interface Garage {
  id: number;
  storageName: string;
  num: number;
  remarks?: string;
  vehicleList: GarageVehicle[];
  order?: number;
}
