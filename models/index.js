import sequelize from '../config/db.js';
import User from './User.js';
import Link from './Link.js';
import Click from './Click.js';
import Setting from './Setting.js';

User.hasMany(Link, { foreignKey: 'userId' });
Link.belongsTo(User, { foreignKey: 'userId' });

Link.hasMany(Click, { foreignKey: 'linkId' });
Click.belongsTo(Link, { foreignKey: 'linkId' });

export { sequelize, User, Link, Click, Setting };
