import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// These are all the attributes in the User model
interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name?: string; 
  role: string;
  isEmailConfirmed: boolean;
}

// Some fields are optional when creating a User
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'name' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string; 
  public role!: string; 
  public isEmailConfirmed!: boolean; 
  

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: new DataTypes.STRING(300),
        allowNull: false,
        unique: true,
      },
      password: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      isEmailConfirmed: {
        type: new DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_email_confirmed'
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: true,
      },
      role: {
        type: new DataTypes.STRING(128),
        allowNull: false,
        defaultValue: 'user'
      },
    },
    {
      tableName: 'users',
      sequelize, // passing the `sequelize` instance is required
    }
  );

  return User;
}
