import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign} from 'hono/jwt'
import { signinInput,signupInput } from "@100xdevs/medium-common";
export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
    }
}>();



userRouter.post('/signup',async (c) => {

    const body=await c.req.json();
    const {success}=signupInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            msg:"invalid inputs"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try{
    const user1=await prisma.user.create({
      data:{
        name:body.name,
        username:body.username,
        password:body.password
      }
    });
    // const user1=await prisma.user.findMany({});
    console.log(user1);
    const jwt=await sign({id:user1.id},c.env.JWT_SECRET);
  
    return c.json({jwt});
  }catch(e){
    console.log(e);
    c.status(403);
    return c.json({msg:"Invalid "});
  }
    
  })
  
userRouter.post('/signin',async (c) => {
    const body=await c.req.json();
    const {success}=signinInput.safeParse(body);

    if(!success){
        c.status(411);
        return c.json({
            msg:"invalid inputs"
        })
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try
    {
    const user=await prisma.user.findFirst({
      where:{
        username:body.username,
        password:body.password
      }
    });
    if(!user){
      c.status(403);
      return c.json({msg:"User not found"});
    }
  
    const jwt=await sign({id:user.id},c.env.JWT_SECRET);
     return c.json({
      jwt
     })
    }catch(e){
      c.status(403);
      return c.json({msg:e});
    }
  })
  