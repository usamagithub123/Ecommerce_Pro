import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from "stripe"

const currency ="usd"
const deliveryCharge=10

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const placeOrder = async (req ,res)=>{
   try {
    const {userId , items , address , amount} = req.body
    const orderData = {
        userId,
        items,
        address,
        amount,
        payment: false,
        paymentMethod:"COD",
        date: Date.now(),
    }
    const newOrder =new orderModel(orderData)
    await newOrder.save()
    await userModel.findByIdAndUpdate(userId, {cartData:{}})
    res.json({success:true, message:"Order Placed"})
   } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
   }
}
const placeOrderStripe = async (req, res)=>{
   try {
    const {userId , items , address , amount} = req.body
    const {origin} = req.headers
    const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod:"Stripe",
        payment: false,
        date: Date.now(),
    }
    const newOrder =new orderModel(orderData)
    await newOrder.save()
    const line_items = items.map((item)=>({ 
        price_data: {
            currency: currency,
            product_data: {
                name: item.name
            },
            unit_amount: item.price*100

        },
        quantity: item.quantity

        }))
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge*100
    
            },
            quantity: 1
        })


    const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
        line_items,
        mode: 'payment'
    })

    res.json({success:true, session_url:session.url})
   } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
   }
}
const verifyStripe = async (req, res)=>{
    const {success, orderId , userId } = req.body
    try {
        if(success === "true"){
            await orderModel.findByIdAndUpdate(orderId, {payment:true})
            await userModel.findByIdAndUpdate(userId, {cartData:{}})
            res.json({success:true, message:"Payment Success"})
        } else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false, message:"Payment Failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}


const placeOrderRazorpay = async (req, res)=>{

}
const allOrders = async (req , res)=>{
     try {
        const orders = await orderModel.find({})
        res.json({success:true, orders})
     } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
     }
}

const userOrders = async (req , res)=>{
   try {
    const {userId} = req.body
    const orders = await orderModel.find({userId})
    res.json({success:true, orders})
   } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
   }
}

const updateStatus = async (req , res)=>{
    try {
        const {orderId , status} = req.body
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success:true, message:"Order Status Updated"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
export {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe}