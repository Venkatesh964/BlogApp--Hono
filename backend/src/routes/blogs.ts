import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from '@prisma/client/edge'
import { Hono } from "hono";
import { verify } from "hono/jwt";


export const blogRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
    },
    Variables:{
        userId: number
    }
}>();


blogRouter.use("/*",async (c,next)=>{
    const authHeader=c.req.header("authorization") || "";
    console.log(authHeader);
    try{
        const user=await verify(authHeader,c.env.JWT_SECRET);
        if(user){
            //@ts-ignore
            c.set("userId",user.id)
            console.log(user);
            await next();
        }else{
            c.status(403);
            return c.json({
                msg:"You are not logged in"
            })
        }

    }catch(e){
        console.log(e);
        return c.json({e});
    }
    
   
})

blogRouter.post('/', async (c) => {
    const body=await c.req.json();
    const authorId=c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try{
   const blog= await prisma.blog.create({
        data:{
            content:body.content,
            title:body.title,
            authorId:authorId
        }
    });
    
    if(!blog){
        c.status(411);
        return c.json({msg:"invalid"})
    }
    return c.json({
        id:blog.id
    })
  }catch(e){
    c.status(411);
    return c.json({msg:"invalid error"});
  }
    
  })
  
  
  blogRouter.put('/',async (c) => {
    const body=await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const blog= await prisma.blog.update({
        where:{
            id:body.id
        },
        data:{
            content:body.content,
            title:body.title,
        }
     });
     
     if(!blog){
         c.status(411);
         return c.json({msg:"invalid"})
     }
     return c.json({
         id:blog.id
     })
   }catch(e){
     c.status(411);
     return c.json({msg:"invalid error"});
   }
  })
  


  blogRouter.get('/bulk',async (c) => {
    
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const blogs=await prisma.blog.findMany();
    return c.json({
        blogs
    });

  }catch(e){
    c.status(411);
    return c.json({
        msg:"error while fetching the blog details"
    })
  }
    
  })
  
  blogRouter.get('/:id',async (c) => {
    const id=c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  
  try{
    const blog= await prisma.blog.findFirst({
        where:{
            id:parseInt(id)
        }
     });
     
     if(!blog){
         c.status(411);
         return c.json({msg:"invalid"})
     }
     return c.json({
         blog
     })
   }catch(e){
     c.status(411);
     console.log(e);
     return c.json({msg:"invalid error"});
   }

  })
  


  //Todo :Add pagination here
