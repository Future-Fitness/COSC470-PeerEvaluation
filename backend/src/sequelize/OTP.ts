import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface OTPAttributes {
  id: number;
  email: string;
  otp_code: string;
  created_at?: Date;
  expires_at: Date;
  is_used?: boolean;
}

export type OTPCreationAttributes = Optional<OTPAttributes, 'id' | 'created_at' | 'is_used'>;

export class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  id!: number;
  email!: string;
  otp_code!: string;
  created_at?: Date;
  expires_at!: Date;
  is_used?: boolean;

  static initModel(sequelize: Sequelize.Sequelize): typeof OTP {
    return OTP.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      }
    }, {
      sequelize,
      tableName: 'OTP',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "idx_email",
          using: "BTREE",
          fields: [
            { name: "email" },
          ]
        },
        {
          name: "idx_expires_at",
          using: "BTREE",
          fields: [
            { name: "expires_at" },
          ]
        },
      ]
    });
  }
}
