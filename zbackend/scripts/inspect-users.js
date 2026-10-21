const { sequelize, User, Role, Department } = require('../models');

async function inspectUsers() {
    try {
        const users = await User.findAll({
            attributes: ['userId', 'userName', 'userMail', 'roleId', 'departmentId', 'status', 'authProvider'],
            include: [
                { model: Role, as: 'role', attributes: ['roleId', 'roleName'] },
                { model: Department, as: 'department', attributes: ['departmentId', 'departmentName'] }
            ]
        });
        console.log(`Found ${users.length} users:`);
        for (const u of users) {
            console.log(`- ID: ${u.userId}, Name: ${u.userName}, Email: ${u.userMail}, Role: ${u.role?.roleName} (${u.roleId}), Dept: ${u.department?.departmentName || 'None'} (${u.departmentId}), Status: ${u.status}`);
        }
    } catch (err) {
        console.error('Error inspecting users:', err);
    } finally {
        await sequelize.close();
    }
}

inspectUsers();
