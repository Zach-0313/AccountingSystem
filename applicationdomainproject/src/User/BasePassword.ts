/* eslint-disable @typescript-eslint/no-explicit-any */
class BasePassword {
    public password: string = "password";
    public previousPasswords: string[] = [];
    public createdAt: Date | undefined;
    public expireOn: Date | undefined;


    constructor(
        password: string,
    ) {
        this.password = password;
        this.createdAt = new Date();
    }
    public GetPassword() {
        return this.password;
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