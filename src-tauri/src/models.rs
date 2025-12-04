// 数据模型定义
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct GarageOverview {
    pub id: Option<i32>,
    pub garage_name: Option<String>,
    pub garage_name_en: Option<String>,
    pub num: Option<i32>,
    pub vehicle_list: Option<String>,
    pub remarks: Option<String>,
    pub order: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VehicleBrand {
    pub id: i32,
    pub brand_name: Option<String>,
    pub brand_name_en: Option<String>,
    pub remarks: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VehicleOverview {
    pub id: i32,
    pub brand_id: Option<i32>,
    pub vehicle_name: Option<String>,
    pub vehicle_name_en: Option<String>,
    pub remarks: Option<String>,
    pub feature: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}