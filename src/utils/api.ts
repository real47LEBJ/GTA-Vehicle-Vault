/**
 * API utility functions
 */
import { invoke } from "@tauri-apps/api/core";
import { Brand, Vehicle, ApiResponse, Garage } from "../types";

/**
 * Generic function to call Tauri backend commands
 * @param command - The name of the Tauri command to call
 * @param args - Arguments to pass to the command
 * @returns A promise that resolves with the command result
 */
export const callBackend = async <T>(
  command: string,
  args?: Record<string, any>
): Promise<T> => {
  try {
    const result = await invoke<T>(command, args);
    return result;
  } catch (error) {
    console.error(`Error calling backend command "${command}":`, error);
    throw error;
  }
};

/**
 * API endpoints configuration
 */
export const apiEndpoints = {
  greet: "greet",
  getBrands: "get_vehicle_brands",
  getVehicles: "get_vehicle_overviews_by_brand",
  getAllVehicles: "get_vehicle_overviews",
  addVehicle: "add_vehicle_overview",
  // Garage endpoints
  getGarages: "get_garage_overviews",
  addGarage: "add_garage_overview",
  updateGarage: "update_garage_overview",
  deleteGarage: "delete_garage_overview",
  // Feature type dict endpoints
  getFeatureTypeDicts: "get_feature_type_dicts",
  getFeatureTypeDictByKey: "get_feature_type_dict_by_key",
  // Vehicle type dict endpoints
  getVehicleTypeDicts: "get_vehicle_type_dicts",
  getVehicleTypeDictByKey: "get_vehicle_type_dict_by_key",
};

/**
 * Feature type dict API functions
 */

/**
 * Gets all feature type dicts
 * @returns A promise that resolves with the list of feature type dicts
 */
export const getFeatureTypeDicts = async (): Promise<ApiResponse<Record<string, string>>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(apiEndpoints.getFeatureTypeDicts);

    // 转换数据格式为键值对映射
    if (response.success && response.data) {
      // 创建一个映射，键为英文单词，值为中文翻译
      const featureDict: Record<string, string> = {};
      response.data.forEach(dict => {
        if (dict.dict_key && dict.dict_value) {
          featureDict[dict.dict_key.trim()] = dict.dict_value.trim();
        }
      });

      return {
        success: true,
        data: featureDict,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取特性类型字典失败",
      };
    }
  } catch (error) {
    console.error("Error fetching feature type dicts:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Vehicle type dict API functions
 */

/**
 * Gets all vehicle type dicts
 * @returns A promise that resolves with the list of vehicle type dicts
 */
export const getVehicleTypeDicts = async (): Promise<ApiResponse<Record<string, string>>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(apiEndpoints.getVehicleTypeDicts);

    // 转换数据格式为键值对映射
    if (response.success && response.data) {
      // 创建一个映射，键为英文单词，值为中文翻译
      const vehicleTypeDict: Record<string, string> = {};
      response.data.forEach(dict => {
        if (dict.dict_key && dict.dict_value) {
          vehicleTypeDict[dict.dict_key.trim()] = dict.dict_value.trim();
        }
      });

      return {
        success: true,
        data: vehicleTypeDict,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取载具类型字典失败",
      };
    }
  } catch (error) {
    console.error("Error fetching vehicle type dicts:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Specific API call functions
 */

/**
 * Calls the greet command
 * @param name - The name to greet
 * @returns A promise that resolves with the greeting message
 */
export const greet = async (name: string): Promise<string> => {
  return callBackend<string>(apiEndpoints.greet, { name });
};

/**
 * Gets all brands
 * @returns A promise that resolves with the list of brands
 */
export const getBrands = async (): Promise<ApiResponse<Brand[]>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(
      apiEndpoints.getBrands
    );

    // 转换数据格式以匹配前端类型定义
    if (response.success && response.data) {
      // 将后端的VehicleBrand转换为前端的Brand格式
      const transformedBrands = response.data.map((brand) => ({
        id: brand.id?.toString() || "",
        brand: brand.brand_name || "",
        brand_en: brand.brand_name_en || "",
      }));

      return {
        success: true,
        data: transformedBrands,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取品牌列表失败",
      };
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Gets vehicles by brand ID
 * @param brandId - The brand ID
 * @returns A promise that resolves with the list of vehicles
 */
export const getVehicles = async (
  brandId: string
): Promise<ApiResponse<Vehicle[]>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(
      apiEndpoints.getVehicles,
      {
        brandId: parseInt(brandId),
      }
    );

    // 转换数据格式以匹配前端类型定义
    if (response.success && response.data) {
      const transformedVehicles = response.data.map((vehicle) => ({
        id: vehicle.id?.toString() || "",
        brand_id: vehicle.brand_id?.toString() || "",
        vehicle_name: vehicle.vehicle_name || "",
        vehicle_name_en: vehicle.vehicle_name_en || "",
        feature: vehicle.feature || "",
        vehicle_type: vehicle.vehicle_type || "",
        price: vehicle.price || 0,
      }));

      return {
        success: true,
        data: transformedVehicles as Vehicle[],
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取载具列表失败",
      };
    }
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Gets all vehicles with brand information
 * @returns A promise that resolves with the list of vehicles with brand information
 */
export const getAllVehicles = async (): Promise<
  ApiResponse<Array<[Brand, Vehicle]>>
> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(
      apiEndpoints.getAllVehicles
    );

    // 转换数据格式以匹配前端类型定义
    if (response.success && response.data) {
      const transformedVehicles = response.data.map((vehicle) => [
        // 品牌信息
        {
          id: vehicle.brand_id?.toString() || "",
          brand: vehicle.brand_name || "",
          brand_en: vehicle.brand_name_en || "",
        },
        // 载具信息
        {
          id: vehicle.id?.toString() || "",
          brand_id: vehicle.brand_id?.toString() || "",
          vehicle_name: vehicle.vehicle_name || "",
          vehicle_name_en: vehicle.vehicle_name_en || "",
          feature: vehicle.feature || "",
          vehicle_type: vehicle.vehicle_type || "",
          price: vehicle.price || 0,
        },
      ]);

      return {
        success: true,
        data: transformedVehicles as [Brand, Vehicle][],
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取载具列表失败",
      };
    }
  } catch (error) {
    console.error("Error fetching all vehicles:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Gets all vehicles with their id and feature
 * @returns A promise that resolves with the list of vehicles id and feature
 */
export const getAllVehiclesFeature = async (): Promise<ApiResponse<Map<string, string>>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(
      apiEndpoints.getAllVehicles
    );

    // 转换数据格式以匹配前端类型定义
    if (response.success && response.data) {
      const featureMap = new Map<string, string>();
      response.data.forEach((vehicle) => {
        if (vehicle.id !== undefined) {
          featureMap.set(vehicle.id.toString(), vehicle.feature || '');
        }
      });

      return {
        success: true,
        data: featureMap,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取载具特性列表失败",
      };
    }
  } catch (error) {
    console.error("Error fetching all vehicles feature:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Adds a new vehicle
 * @param vehicle - The vehicle to add
 * @returns A promise that resolves with the added vehicle
 */
export const addVehicle = async (
  vehicle: Vehicle
): Promise<ApiResponse<Vehicle>> => {
  try {
    // 转换前端数据格式以匹配后端API要求
    const vehicleData = {
      id: parseInt(vehicle.id),
      brand_id: parseInt(vehicle.brand_id),
      vehicle_name: vehicle.vehicle_name,
      vehicle_name_en: vehicle.vehicle_name_en,
      feature: vehicle.feature,
      remarks: null, // 后端需要remarks字段
    };

    // 调用后端API
    const response = await callBackend<ApiResponse<any>>(
      apiEndpoints.addVehicle,
      {
        vehicle: vehicleData,
      }
    );

    // 转换响应数据格式
    if (response.success && response.data) {
      const transformedVehicle = {
        id: response.data.id?.toString() || "",
        brand_id: response.data.brand_id?.toString() || "",
        vehicle_name: response.data.vehicle_name || "",
        vehicle_name_en: response.data.vehicle_name_en || "",
        feature: response.data.feature || "",
      };

      return {
        success: true,
        data: transformedVehicle as Vehicle,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "添加载具失败",
      };
    }
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return {
      success: false,
      data: null,
      error: "添加数据时发生错误",
    };
  }
};

/**
 * Garage API functions
 */

/**
 * Gets all garages
 * @returns A promise that resolves with the list of garages
 */
export const getGarages = async (): Promise<ApiResponse<Garage[]>> => {
  try {
    // 调用后端API获取原始数据
    const response = await callBackend<ApiResponse<any[]>>(
      apiEndpoints.getGarages
    );

    // 转换数据格式以匹配前端类型定义
    if (response.success && response.data) {
      // 将后端的GarageOverview转换为前端的Garage格式
      const transformedGarages = response.data.map((garage) => {
        let vehicleList = [];

        // 解析vehicle_list JSON字符串
        if (garage.vehicle_list) {
          try {
            vehicleList = JSON.parse(garage.vehicle_list);
          } catch (e) {
            console.error("Error parsing vehicle_list:", e);
            vehicleList = [];
          }
        }

        return {
          id: garage.id || 0,
          storageName: garage.garage_name || "",
          num: garage.num || 0,
          remarks: garage.remarks || undefined,
          vehicleList: vehicleList,
          order: garage.order || undefined,
        };
      });

      return {
        success: true,
        data: transformedGarages,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "获取车库列表失败",
      };
    }
  } catch (error) {
    console.error("Error fetching garages:", error);
    return {
      success: false,
      data: null,
      error: "获取数据时发生错误",
    };
  }
};

/**
 * Adds a new garage
 * @param garage - The garage to add
 * @returns A promise that resolves with the added garage
 */
export const addGarage = async (
  garage: Omit<Garage, "id">
): Promise<ApiResponse<Garage>> => {
  try {
    // 转换前端数据格式以匹配后端API要求
    const garageData = {
      garage_name: garage.storageName,
      garage_name_en: null, // 暂时不需要英文名称
      num: garage.num,
      remarks: garage.remarks || null,
      vehicle_list: JSON.stringify(garage.vehicleList),
      order: garage.order,
    };

    // 调用后端API
    const response = await callBackend<ApiResponse<any>>(
      apiEndpoints.addGarage,
      {
        garage: garageData,
      }
    );

    // 转换响应数据格式
    if (response.success && response.data) {
      let vehicleList = [];

      // 解析vehicle_list JSON字符串
      if (response.data.vehicle_list) {
        try {
          vehicleList = JSON.parse(response.data.vehicle_list);
        } catch (e) {
          console.error("Error parsing vehicle_list:", e);
          vehicleList = [];
        }
      }

      const transformedGarage = {
        id: response.data.id || 0,
        storageName: response.data.garage_name || "",
        num: response.data.num || 0,
        remarks: response.data.remarks || undefined,
        vehicleList: vehicleList,
        order: response.data.order || undefined,
      };

      return {
        success: true,
        data: transformedGarage,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "添加车库失败",
      };
    }
  } catch (error) {
    console.error("Error adding garage:", error);
    return {
      success: false,
      data: null,
      error: "添加数据时发生错误",
    };
  }
};

/**
 * Updates an existing garage
 * @param garage - The garage to update
 * @returns A promise that resolves with the updated garage
 */
export const updateGarage = async (
  garage: Garage
): Promise<ApiResponse<Garage>> => {
  try {
    // 转换前端数据格式以匹配后端API要求
    const garageData = {
      id: garage.id,
      garage_name: garage.storageName,
      garage_name_en: null, // 暂时不需要英文名称
      num: garage.num,
      remarks: garage.remarks || null,
      vehicle_list: JSON.stringify(garage.vehicleList),
      order: garage.order,
    };

    // 调用后端API
    const response = await callBackend<ApiResponse<any>>(
      apiEndpoints.updateGarage,
      {
        garage: garageData,
      }
    );

    // 转换响应数据格式
    if (response.success && response.data) {
      let vehicleList = [];

      // 解析vehicle_list JSON字符串
      if (response.data.vehicle_list) {
        try {
          vehicleList = JSON.parse(response.data.vehicle_list);
        } catch (e) {
          console.error("Error parsing vehicle_list:", e);
          vehicleList = [];
        }
      }

      const transformedGarage = {
        id: response.data.id || 0,
        storageName: response.data.garage_name || "",
        num: response.data.num || 0,
        remarks: response.data.remarks || undefined,
        vehicleList: vehicleList,
        order: response.data.order || undefined,
      };

      return {
        success: true,
        data: transformedGarage,
        error: null,
      };
    } else {
      return {
        success: false,
        data: null,
        error: response.error || "更新车库失败",
      };
    }
  } catch (error) {
    console.error("Error updating garage:", error);
    return {
      success: false,
      data: null,
      error: "更新数据时发生错误",
    };
  }
};

/**
 * Deletes a garage
 * @param id - The ID of the garage to delete
 * @returns A promise that resolves with the result
 */
export const deleteGarage = async (id: number): Promise<ApiResponse<void>> => {
  try {
    // 调用后端API
    const response = await callBackend<ApiResponse<any>>(
      apiEndpoints.deleteGarage,
      {
        id: id,
      }
    );

    return {
      success: response.success,
      data: null,
      error: response.error || (response.success ? null : "删除车库失败"),
    };
  } catch (error) {
    console.error("Error deleting garage:", error);
    return {
      success: false,
      data: null,
      error: "删除数据时发生错误",
    };
  }
};

/**
 * Handles API error responses
 * @param error - The error object
 * @returns A formatted error message
 */
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

/**
 * Wraps API calls to handle errors consistently
 * @param apiCall - The API call function
 * @returns A promise that resolves with a standardized response
 */
export const wrapApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<ApiResponse<T>> => {
  try {
    const data = await apiCall();
    return {
      success: true,
      data: data as T,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: handleApiError(error),
    };
  }
};
