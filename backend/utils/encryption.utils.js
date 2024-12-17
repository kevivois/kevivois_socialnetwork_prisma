import bcrypt from "bcrypt";

export function encryptPassword(plane_password){
    return bcrypt.hashSync(plane_password,10)
}
