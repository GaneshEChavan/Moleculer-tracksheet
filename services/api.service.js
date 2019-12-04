"use strict";
const _ = require("lodash");
const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 4001,

		routes: [{
			path: "/api",
			authorization: true,
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			],
			aliases: {
				"POST generate": "technology.task",
				"PUT Week": "technology.week",
				"GET Sheet": "technology.sheet",
				"PUT Stage":"technology.stage"
			},
			cors: true,
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		},

		// use: [

		// simulate a middleware error
		// (req, res, next) => {
		//   next(new Error('Something went wrong'))
		// },

		// 	simulate a error handling middleware
		// 	function (err, req, res, next) {
		// 	  this.logger.error('Error is occured in middlewares!');
		// 	  this.sendError(req, res, err);
		// 	},

		//   ],
	},
	methods: {
		authorize(ctx, route, req) {
			return new this.Promise((res, rej) => {
				let token = req.headers.token

				if (token) {
					// Verify JWT token
					ctx.call("users.resolveToken", { token })
						.then(user => {
							if (user) {
								this.logger.info("Authenticated via JWT: ", user.email);
								ctx.meta.user = user;
							}
							return res(ctx);
						})
						.catch(err => {
							return rej({ status: false, message: "Authentication Failed" })
						});
				}
			})



		}
	}
};
