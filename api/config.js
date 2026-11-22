import { json } from './_db.js';
export default function handler(req,res){
 json(res,200,{delivery_fee:Number(process.env.DELIVERY_FEE||0)||0,pay_number:process.env.PAYMENT_NUMBER||'',pay_name:process.env.PAYMENT_NAME||'',pay_network:process.env.PAYMENT_NETWORK||'M-Pesa / Tigo Pesa / Airtel Money',shop_phone:process.env.SHOP_PHONE||''});
}
