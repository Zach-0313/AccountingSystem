import BasePassword from "./BasePassword";

class BaseUser {
    id: string = "ID";
    firstName: string = "John";
    lastName: string = "Doe";
    username: string = "username";
    password: BasePassword = new BasePassword("password");
    dob: string = "dob";
    email: string = "email";
    role: "user" | "admin" | "manager";
    public createdAt: Date;
    public is_active: boolean = true;
    public dateOfBirth: Date;


    constructor(
        id: string,
        username: string,
        password: BasePassword,
        firstName: string,
        lastName: string,
        dateOfBirth: string,
        email: string,
        role: "admin" | "user" | "manager" = "user",
        is_active: boolean = true
    ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dateOfBirth;
        this.email = email;
        this.role = role;
        this.is_active = is_active;
    }
}

export default BaseUser;