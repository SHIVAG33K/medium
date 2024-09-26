import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {verify} from 'hono/jwt'
import { createPostInput, updatePostInput } from "dark-common-app";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables : {
        userID : string
    }
}>();
blogRouter.use("/*",async (c,next) =>{
    const authHeader = c.req.header("authorization")  || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if(user) {
        c.set("userID" , user.id as string);
        await next();
    }else {
        c.json({
            message : "you are not logged in"
        })
    }

});

blogRouter.post('/', async (c) => {
    const userId =  c.get("userID")
    const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = createPostInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const post = await prisma.post.create({
        data : {
            title : body.title,
            content: body.content,
			authorId: userId
        }
    });
    console.log(post)
    return c.json({
        id : post.id
    })

})

  
blogRouter.put('/', async(c) => {
    const userId = await c.get('userID');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
    const body = await c.req.json()
    const { success } = updatePostInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    prisma.post.update({
            where: {
                id: body.id,
                authorId: userId
            },
            data: {
                title: body.title,
                content: body.content
            }
        });
        
	return c.text('updated post');
  })
  
blogRouter.get('/bulk', async(c) => {
    console.log("Dwad");
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const posts = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }   
    });
	return c.json(posts);
  })
  
blogRouter.get('/:id', async(c) => {
    const id = c.req.param('id');
	const prisma = new PrismaClient({
	datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		},
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    name: true
                }
            }
        }
	});

	return c.json(post);
  })
