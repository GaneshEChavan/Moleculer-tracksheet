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

    model: sheetSchema.tech,
    settings: {
        // fields: ["firstName", "lastName", "email", "contact", "github"],
        entityValidator: {
            techno: { type: "string" },
            stage: { type: "string" },
            week: { type: "string" },
            task: { type: "string" }
        }
    },
    dependencies: [],

    actions: {

        add: {
            // auth: "required",
            // params: {
            //     technology: {
            //         type: "object", props: {
            //             techno: { type: "string" },
            //             stage: { type: "string" },
            //             week: { type: "string" },
            //             task: { type: "string" }
            //         }
            //     }
            // },
            handler(ctx) {
                console.log("tech.service------->45", ctx.meta.fromStage);
                let info = ctx.meta.user;
                let entity = ctx.params.technology;
                // return this.validateEntity(entity)
                //     .then(() => {
                //         if (entity.email) {
                //             return sheetSchema.tech.find({ userID: info.id }).then(found => {
                //                 console.log("found in user", found);

                //                 if (found.length > 0) {
                //                     return Promise.reject(new MoleculerClientError("technology already Specified", 422, "", [{ field: "techno", message: "is exist" }]));
                //                 }
                //             })
                //         }
                //     })
                //     .then(() => {
                //         let techData = new sheetSchema.tech({
                //             userID: info.id,
                //             techno: entity.techno
                //         })
                //         return techData.save().then(data => {
                //             console.log("data saved to DB", data);
                //             ctx.call("technology.stage", null, {
                //                 meta: {
                //                     info: {
                //                         id: data._id,
                //                         entity: ctx.params.technology
                //                     }
                //                 }
                //             })
                //             return Promise.resolve(data)
                //         })
                //     })
                return new this.Promise((res, rej) => {
                    let techData = new sheetSchema.tech({
                        userID: ctx.meta.fromStage.user,
                        techno: ctx.meta.fromStage.entity.techno
                    })
                    return techData.save().then(data => {
                        sheetSchema.tech.findByIdAndUpdate({ "_id": data._id }, { $addToSet: { "stage": ctx.meta.fromStage.id } }).then((Data) => {
                            console.log("tech.service--------------->85", Data)
                            return res(Data)
                        })
                    }).catch(err => {
                        return
                        rej(new MoleculerClientError("unable to add technology", 400, "", [{ field: "technology", message: "is not added" }]))
                    })
                })
            }
        },

        stage: {
            // auth: "required",
            // params: {
            //     user: {
            //         type: "object", props: {
            //            stage : {type: "string"}
            //         }
            //     }
            // },
            handler(ctx) {
                if (ctx.meta.fromWeek) {
                    return new this.Promise((res, rej) => {
                        sheetSchema.stage.find({ "userID": ctx.meta.fromWeek.user, "stage": ctx.meta.fromWeek.entity.stage }).then(data => {
                            console.log("data in techno.service------------->108", data)
                            if (data.length > 0) {
                                rej(new MoleculerClientError("stage already added for particuler user-tech.service", 400))
                            } else {
                                let techData = new sheetSchema.stage({
                                    stage: ctx.meta.fromWeek.entity.stage,
                                    userID: ctx.meta.fromWeek.user
                                })
                                techData.save().then(stageAdd => {
                                    sheetSchema.stage.findByIdAndUpdate({ "_id": stageAdd._id }, { $addToSet: { "week": ctx.meta.fromWeek.id } }).then(() => {
                                        ctx.call("technology.add", null, {
                                            meta: {
                                                fromStage: {
                                                    id: stageAdd._id,
                                                    entity: ctx.meta.fromWeek.entity,
                                                    user: ctx.meta.fromWeek.user
                                                }
                                            }
                                        }).then(() => {
                                            this.logger.info("called")
                                            return res("created")
                                        })
                                    })
                                }).catch(err => {
                                    rej(new MoleculerClientError("unable to add stage-tech.service", 400, "", [{ field: "stage", message: "is not added" }]))
                                })
                            }
                        }).catch(err => {
                            rej(new MoleculerClientError("Something went wrong-tech.service", 400))
                        })
                    })
                } else {
                    return new this.Promise((res, rej) => {
                        sheetSchema.stage.find({ "userID": ctx.meta.user.id, "stage": ctx.params.stage }).then(data => {
                            if (data.length > 0) {
                                rej(new MoleculerClientError("stage already added to particuler user", 400))
                            } else {
                                let techData = new sheetSchema.stage({
                                    stage: ctx.params.stage,
                                    userID: ctx.meta.user.id
                                })
                                techData.save().then(data => {
                                    res(data)
                                }).catch(err => {
                                    rej(new MoleculerClientError("unable to add stage", 400))
                                })
                            }
                        }).catch(err => {
                            rej(new MoleculerClientError("something went wrong-tech.service", 400))
                        })
                    })
                }


            }
        },

        week: {

            handler(ctx) {
                if (ctx.meta.info !== undefined) {
                    return new this.Promise((res, rej) => {
                        sheetSchema.week.find({ "userID": ctx.meta.info.user, "week": ctx.meta.info.entity.week }).then(data => {
                            if (data.length > 0) {
                                rej(new MoleculerClientError("Week alredy exists for perticuler user-tech.service", 400))
                            } else {
                                let techData = new sheetSchema.week({
                                    week: ctx.meta.info.entity.week,
                                    userID: ctx.meta.info.user
                                })
                                techData.save().then(data => {
                                    sheetSchema.week.findByIdAndUpdate({ "_id": data._id }, { $addToSet: { "task": ctx.meta.info.id } }).then(updated => {
                                        ctx.call("technology.stage", null, {
                                            meta: {
                                                fromWeek: {
                                                    id: updated._id,
                                                    entity: ctx.meta.info.entity,
                                                    user: ctx.meta.info.user
                                                }
                                            }
                                        }).then(() => {
                                            this.logger.info("called ")
                                            return ("created")
                                        })
                                    })
                                }).catch(err => {
                                    rej(new MoleculerClientError("unable to add week", 400, "", [{ field: "week", message: "is not added" }]))
                                })
                            }
                        })

                    })
                } else {
                    return new this.Promise((res, rej) => {
                        sheetSchema.week.find({ "userID": ctx.meta.user.id, "week": ctx.params.week }).then(data => {
                            console.log("tech.service--------------->169", data.length)
                            if (data.length > 0) {
                                rej(new MoleculerClientError("Week already added", 400))
                            } else {
                                let techData = new sheetSchema.week({
                                    week: ctx.params.week,
                                    userID: ctx.meta.user.id
                                })
                                techData.save().then(data => {
                                    res(data)
                                })
                            }
                        })



                    })
                }


            }
        },

        task: {
            // auth: "required",
            params: {
                technology: {
                    type: "object", props: {
                        techno: { type: "string" },
                        stage: { type: "string" },
                        week: { type: "string" },
                        task: { type: "string" }
                    }
                }
            },
            handler(ctx) {
                console.log("------------------------------->188", ctx.params.technology);
                console.log("------------------------------->189", ctx.params);
                let entity = ctx.params.technology;
                if (entity.techno !== "" && entity.stage !== "" && entity.week !== "" && entity.task !== "") {
                    return this.validateEntity(entity)
                        .then(() => {
                            return sheetSchema.task.find({ "userID": ctx.meta.user.id, "task": entity.task }).then(async data => {
                                if (data.length > 0) {
                                    return Promise.reject(new MoleculerClientError("task is already added to particuler user", 400))
                                } else {
                                    let techData = new sheetSchema.task({
                                        task: entity.task,
                                        userID: ctx.meta.user.id
                                    })
                                    const data_1 = await techData.save();
                                    console.log("data saved to DB", data_1);
                                    ctx.call("technology.week", null, {
                                        meta: {
                                            info: {
                                                id: data_1._id,
                                                entity: ctx.params.technology,
                                                user: ctx.meta.user.id
                                            }
                                        }
                                    }).then(() => {
                                        this.logger.info("called");
                                        return res("created")
                                    });
                                }
                            })

                        })
                } else {
                    return Promise.reject(new MoleculerClientError("All fields must be filled", 400))
                }

            }
        },

        sheet: {
            handler(ctx) {
                console.log("------------------------------>228", ctx.params.id)
                let entity = ctx.params.id
                return new this.Promise((res, rej) => {
                    sheetSchema.tech.find({ "userID": ctx.meta.user.id }).populate({
                        path: "stage",
                        model: "Stages",
                        populate: {
                            path: "week",
                            model: "Weeks",
                            populate: {
                                path: "task",
                                model: "Tasks"
                            }
                        }
                    }).then(data => {
                        res(data)
                    }).catch(err => {
                        rej(new MoleculerClientError("unable to get track sheet", 400, "", [{ field: "track-sheet", message: "is not fetched" }]))
                    })
                })

            }
        }
    }
}