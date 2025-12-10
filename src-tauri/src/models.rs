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
    pub garage_order: Option<i32>,
    pub garage_type: Option<String>,
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
    pub id: String,
    pub brand_id: Option<i32>,
    pub vehicle_name: Option<String>,
    pub vehicle_name_en: Option<String>,
    pub vehicle_type: Option<String>,
    pub feature: Option<String>,
    pub price: Option<i32>,
    pub remarks: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FeatureTypeDict {
    pub id: i32,
    pub dict_key: Option<String>,
    pub dict_value: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}