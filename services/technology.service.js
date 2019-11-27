"use strict"
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const objectId = require("mongodb").ObjectID;
const moleculerAdapter = require("moleculer-db-adapter-mongoose");
const DbService = require("moleculer-db");
const { MoleculerClientError } = require("moleculer").Errors;
const { validationError } = require("moleculer").Errors;
const sheetSchema = require("../model/technology")
require("dotenv").config()

module.exports = {
    name: "technology",
    mixins: [DbService],

    adapter: new moleculerAdapter(process.env.MONGO_PORT),

    model: sheetSchema,
    settings: {
        fields: ["firstName", "lastName", "email", "contact", "github"],
        entityValidator: {
            techno: { type: "string" }

        }
    },
    dependencies: [],

    actions: {
        add: {
            auth: "required",
            params: {
                technology: {
                    type: "object", props: {
                        techno: { type: "string" }
                    }
                }
            },
            handler(ctx) {
                console.log("tech.service------>39",ctx.meta);
                let info = ctx.meta.user;
                let entity = ctx.params.technology;
                return this.validateEntity(entity)
                    .then(() => {
                        if (entity.email) {
                            return sheetSchema.find({ userID: info.id }).then(found => {
                                console.log("found in user", found);

                                if (found.length > 0) {
                                    return Promise.reject(new MoleculerClientError("technology already Specified", 422, "", [{ field: "techno", message: "is exist" }]));
                                }
                            })
                        }
                    })
                    .then(() => {
                        let techData = new sheetSchema({
                            userID: info.id,
                            techno: entity.techno
                        })
                        return techData.save().then(data => {
                            console.log("data saved to DB", data);
                             return Promise.resolve(data)
                        })
                    })
            }
        },

        login: {
            params: {
                user: {
                    type: "object", props: {
                        email: { type: "email" },
                        password: { type: "string" }
                    }
                }
            },
            handler(ctx) {
                let { email, password } = ctx.params.user;
                return this.Promise.resolve().then(() => {
                    userSchema.findOne({ email }).then(found => {
                        console.log('found user', found)
                        return bcrypt.compare(password, found.password).then(res => {
                            console.log("bcrypt compare res", res)
                            if (res === true) {
                                return Promise.resolve(found)
                            } else {
                                return Promise.reject(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found" }]))
                            }
                        })
                    })
                })
            }
        }
    }
}