export interface userDataType {
     user_id : number;
  username: string;
  user_email:string;
  user_phone:string;
  user_country_code:string;
  status:string;
  last_login:any;
  user_created_at:any;
  shop_id:number;
  shopDescription:string;
  shopAddress:string;
  building_name:string;
  shopImage:string;
  is_open: number;
  shop_email:string
  shop_phone:string;
  shop_country_code:string;
  shop_created_at:any
}

export interface shopDataType {
  building_name:string;
  country_code:string;
  created_at:string;
  email:string;
  id:number;
  isSetupComplete:number;
  is_open:number;
  owner_id:number;
  phone:string;
  rating:string;
  shopAddress:string;
  shopDescription:string;
  shopImage:string;
  shopname:string
}


export interface cartDataType {
variantId: null;
addons:any;
cartId:number;
imageUrl:number;
menuId:number;
menuName:string;
notes:string;
price:string;
quantity:number;
shopAddress:string;
shopname:string;
ingredients:string;
snapshotPrice:string;
unitPrice:number
}

export interface menuType {
  categoryId:number;
  created_at:string;
  imageUrl:string;
  ingredients:string;
  isAvailable:number;
  menuName:string;
  price:string;
  rating:number;
  shopId:number;
  status:string;
  updated_at:string;
  menuId:number;
}


export interface userProfileDataType{
  userEmail:string;
  userImage:null;
  userPhone:string;
  username:string;
}
export interface BestSellerRow {
  menuId: number;
  menuName?: string;
  price?: number | string | null;
  imageUrl?: string | null;
  shopId?: number | null;
  shopname?: string | null;
  shopImage?: string | null;
  // optional flag
  is_bestseller?: number | string | boolean;
  is_bestsellers?: number | string | boolean;
  // Other possible flags / legacy names
  [k: string]: any;
}

export interface ShopGrouped {
  shopId: number;
  shopName: string;
  shopImage?: string | null;
  bestMenus: BestSellerRow[];
}

/** payload used by addToCart thunk */
export interface CartPayload {
  shopId: number;
  menuId: number;
  quantity?: number;
  variantId?: number | null;
  addons?: any[];
  notes?: string;
}