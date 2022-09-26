const Role = require('../model/Role');

class RoleClass {

    async roles() {
        return await Role.find();
    }

    async roleUser()
    {
        let role = await Role.findOne({name:'User'});
        return role._id;
    }
}

module.exports = {
    RoleClass: new RoleClass()
}
