import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
    const  {navigate, token , setCartItems, backendUrl} = useContext(ShopContext);
    const [searchParams , setSearchParams] = useSearchParams();
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');
    const verifyPayment=async()=>{
         try {
            if(!token){
                return null
            }
            const response = await axios.post(backendUrl + '/api/order/verifyStripe', {success , orderId} ,{headers:{token}});
            if(response.data.success){
                setCartItems([]);
                localStorage.removeItem("cart"); 
                navigate('/orders');
            } else{
                navigate('/cart')
                localStorage.removeItem("cart"); 
                setCartItems([]);
            }

         } catch (error) {
            // console.log(error);
            // toast.error(error.message);
            setCartItems([]);
            navigate('/')
            localStorage.removeItem("cart"); 
            
         }finally{
            setCartItems([]);
         }
    }

    useEffect(()=>{
        verifyPayment()
    },[])
  return (
    <div>
   
    </div>
  )
}

export default Verify