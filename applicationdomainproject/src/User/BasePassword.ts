/* eslint-disable @typescript-eslint/no-explicit-any */
class BasePassword {
    public password: string = "password";
    public previousPasswords: string[] = [];
    public createdAt: Date | undefined;
    public expireOn: Date | undefined;
    regexNum = new RegExp('^[1-9]d{0,2}$');
    regexLetter = new RegExp(/[a-zA-Z]/g);
    regexSpecial = new RegExp(/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/);


    constructor(
        password: string,
    ) {
        this.password = password;
        this.createdAt = new Date();
    }
    public GetPassword() {
        return this.password;
    }
    public createPassword(newPassword: string): boolean { // creates new password
        this.password = newPassword;

        // check password length
        if (this.password.length < 8) {
            console.warn("Password must be at least 8 characters long.");
            return false;
        }
        // checks password for a number
        else if (!this.regexNum.test(this.password)) {
            console.warn("Password must contain a number");
            return false;
        }
        // checks password for a letter
        else if (!this.regexLetter.test(this.password)) {
            console.warn("Password must contain a letter");
            return false;
        }
        // makes sure password starts with letter
        else if (!this.regexLetter.test(this.password[0])) {
            console.warn("Password must start with a letter");
            return false;
        }
        // check for special character
        else if (!this.regexSpecial.test(this.password)) {
            console.warn("Password must contain a special character");
            return false;
        }
        else {
            return true;
        }

    }
    public changePassword(newPassword: string): boolean {
        if (this.IsPreviousPassword(newPassword)) {
            console.warn("Cannot reuse an old password.");
            return false;
        }

        this.previousPasswords.push(this.password); // Store the old password
        this.password = newPassword;
        return true;
    }
    public IsPassword(value: string) : boolean {
        return this.password === value;
    }
    public IsPreviousPassword(value: string): boolean  {
        return (this.previousPasswords.includes(value));
    }
    public AddPreviousPassword(value: string) : void {
        if (!this.previousPasswords) {
            this.previousPasswords = [];
        }
        this.previousPasswords.push(value);
    }
    public setExpiration(days: number = 90): void {
        this.expireOn = new Date();
        this.expireOn.setDate(this.expireOn.getDate() + days);
    }

    /** Check if the password is expired */
    public isExpired(): boolean {
        return this.expireOn ? new Date() > this.expireOn : false;
    }
    /** Convert to JSON for storage */
    public toJSON() {
        return {
            passwordSaved: this.password, // Consider hashing before saving
            previousPasswords: this.previousPasswords,
            createdAt: this.createdAt.toISOString(),
            expireOn: this.expireOn ? this.expireOn.toISOString() : null,
        };
    }

    /** Create a BasePassword instance from JSON */
    public static fromJSON(json: any): BasePassword {
        const basePassword = new BasePassword(json.passwordSaved);
        basePassword.previousPasswords = Array.isArray(json.previousPasswords) ? json.previousPasswords : [];
        basePassword.createdAt = json.createdAt ? new Date(json.createdAt) : new Date();
        basePassword.expireOn = json.expireOn ? new Date(json.expireOn) : undefined;

        return basePassword;
    }

}

export default BasePassword;