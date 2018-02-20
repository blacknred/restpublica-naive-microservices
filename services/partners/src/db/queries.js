const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const ApiPlan = mongoose.model('ApiPlan');
const PartnerApp = mongoose.model('PartnerApp');

/* api plans */
const findPlanByName = (name) => {
    ApiPlan.find({ name })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const createPlan = (planObj) => {
    const plan = new ApiPlan(planObj);
    plan.save()
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};
const getAllPlans = () => {
    ApiPlan.find({})
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const getPlan = (planId) => {
    ApiPlan.findById(planId)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const updatePlan = (planId, planObj) => {
    ApiPlan.findOneAndUpdate({ _id: planId }, planObj, { new: true })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const deletePlan = (planId) => {
    ApiPlan.remove({ _id: planId })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

/* partner apps */

const findAppByDomain = (domain) => {
    PartnerApp.find({ domain })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const checkApp = (apiKey, domain) => {
    PartnerApp.find({ apiKey, domain })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const createApp = (appObj) => {
    const app = new PartnerApp(appObj);
    app.save()
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};
const getAllApps = () => {
    PartnerApp.find({})
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const getApp = (appId) => {
    PartnerApp.findById(appId)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const updateApp = (appId, appObj) => {
    PartnerApp.findOneAndUpdate({ _id: appId }, appObj, { new: true })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

const deleteApp = (appId) => {
    PartnerApp.remove({ _id: appId })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
};

module.exports = {
    findPlanByName,
    getAllPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    findAppByDomain,
    checkApp,
    getAllApps,
    getApp,
    createApp,
    updateApp,
    deleteApp
};
