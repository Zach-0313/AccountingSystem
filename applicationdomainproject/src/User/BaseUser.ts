/* eslint-disable @typescript-eslint/no-explicit-any */
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
    /** Convert to JSON for storage */
    public toJSON() {
        return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            dob: this.dob,
            email: this.email,
            role: this.role,
            is_active: this.is_active,
            createdAt: this.createdAt,
            dateOfBirth: this.dateOfBirth,
            password: this.password.toJSON(), // Ensure password is serializable
        };
    }

    /** Create a BaseUser instance from JSON */
    public static fromJSON(json: any): BaseUser {
        return new BaseUser(
            json.id,
            json.username,
            BasePassword.fromJSON(json.password), // Recreate BasePassword instance
            json.firstName,
            json.lastName,
            json.dob,
            json.email,
            json.role,
            json.is_active
        );
    }

}

export default BaseUser;