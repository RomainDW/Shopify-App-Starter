import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import Shopify from "shopify-api-node";
import bodyParser from "koa-bodyparser";
import * as handlers from "./handlers/index";
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(
    session(
      {
        sameSite: "none",
        secure: true
      },
      server
    )
  );
  server.use(bodyParser());
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none"
        });
        ctx.redirect("/");
      }
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.October19
    })
  );
  router.get("/api/:object", async ctx => {
    try {
      const results = await fetch(
        "https://" +
          ctx.cookies.get("shopOrigin") +
          "/admin/api/2020-01/" +
          ctx.params.object +
          ".json",
        {
          headers: {
            "X-Shopify-Access-Token": ctx.session.accessToken
          }
        }
      ).then(response => response.json());
      // .then(json => {
      //   return json;
      // });
      ctx.body = {
        status: "success",
        data: results
      };
    } catch (err) {
      console.log(err);
    }
  });
  router.put("/create-asset/:themeId", (ctx, next) => {
    const shopify = new Shopify({
      shopName: "my-app-test-dev",
      accessToken: ctx.session.accessToken
    });

    try {
      const results = shopify.asset
        .create(ctx.request.body.themeId, {
          key: "sections/test-template.liquid",
          value: ctx.request.body.value
        })
        .catch(err => {
          console.log(err);
        });

      ctx.body = {
        status: "success",
        data: results
      };
    } catch (err) {
      console.log(err);
    }
  });
  router.get("*", verifyRequest(), async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
